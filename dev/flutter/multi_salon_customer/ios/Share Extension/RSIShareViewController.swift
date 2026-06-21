//
// RSIShareViewController.swift
// receive_sharing_intent 1.8.1 — vendored for Share Extension (no Flutter plugin).
//

import AVFoundation
import MobileCoreServices
import Photos
import Social
import UIKit
import UniformTypeIdentifiers

@available(swift, introduced: 5.0)
open class RSIShareViewController: SLComposeServiceViewController {
    var hostAppBundleIdentifier = ""
    var appGroupId = ""
    var sharedMedia: [SharedMediaFile] = []

    private var didRedirect = false
    private var didStartProcessing = false
    private var pendingAttachments = 0
    private var processedAttachments = 0

    open func shouldAutoRedirect() -> Bool {
        return true
    }

    open override func isContentValid() -> Bool {
        return true
    }

    open override func viewDidLoad() {
        super.viewDidLoad()
        loadIds()
    }

    open override func didSelectPost() {
        saveAndRedirect(message: contentText)
    }

    open override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        beginAutoRedirectIfNeeded()
    }

    open override func presentationAnimationDidFinish() {
        super.presentationAnimationDidFinish()
        beginAutoRedirectIfNeeded()
    }

    private func beginAutoRedirectIfNeeded() {
        guard !didRedirect else { return }
        guard shouldAutoRedirect() else { return }
        guard !didStartProcessing else { return }
        didStartProcessing = true
        processInputItems()
    }

    open override func configurationItems() -> [Any]! {
        return []
    }

    // MARK: - Attachment processing

    private func processInputItems() {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem], !items.isEmpty else {
            dismissWithError()
            return
        }

        let attachments = items.flatMap { $0.attachments ?? [] }
        guard !attachments.isEmpty else {
            dismissWithError()
            return
        }

        pendingAttachments = attachments.count
        processedAttachments = 0

        for attachment in attachments {
            loadAttachment(attachment)
        }
    }

    private func loadAttachment(_ attachment: NSItemProvider) {
        if tryLoadFileRepresentation(attachment) {
            return
        }
        loadAttachmentWithLoadItem(attachment)
    }

    /// Photos / screenshots are most reliable via loadFileRepresentation (temp file copied in callback).
    private func tryLoadFileRepresentation(_ attachment: NSItemProvider) -> Bool {
        for (mediaType, identifier) in fileRepresentationTypeOrder() {
            guard attachment.hasItemConformingToTypeIdentifier(identifier) else { continue }

            attachment.loadFileRepresentation(forTypeIdentifier: identifier) { [weak self] url, error in
                guard let self = self else { return }
                if let url = url, error == nil, self.ingestFileURL(url, as: mediaType) {
                    self.markAttachmentProcessed()
                } else {
                    self.loadAttachmentWithLoadItem(attachment)
                }
            }
            return true
        }
        return false
    }

    private func fileRepresentationTypeOrder() -> [(SharedMediaType, String)] {
        if #available(iOS 14.0, *) {
            return [
                (.image, UTType.png.identifier),
                (.image, UTType.jpeg.identifier),
                (.image, UTType.heic.identifier),
                (.image, UTType.image.identifier),
                (.video, UTType.movie.identifier),
                (.file, UTType.fileURL.identifier),
            ]
        }
        return [
            (.image, "public.png"),
            (.image, "public.jpeg"),
            (.image, "public.image"),
            (.video, "public.movie"),
            (.file, "public.file-url"),
        ]
    }

    private func loadAttachmentWithLoadItem(_ attachment: NSItemProvider) {
        let typePairs = preferredTypeLoadOrder()

        func tryType(at index: Int) {
            guard index < typePairs.count else {
                markAttachmentProcessed()
                return
            }

            let (mediaType, identifier) = typePairs[index]
            guard attachment.hasItemConformingToTypeIdentifier(identifier) else {
                tryType(at: index + 1)
                return
            }

            attachment.loadItem(forTypeIdentifier: identifier) { [weak self] data, error in
                guard let self = self else { return }
                if error != nil {
                    tryType(at: index + 1)
                    return
                }
                if self.ingestLoadedItem(data, as: mediaType) {
                    self.markAttachmentProcessed()
                } else {
                    tryType(at: index + 1)
                }
            }
        }

        tryType(at: 0)
    }

    private func preferredTypeLoadOrder() -> [(SharedMediaType, String)] {
        var pairs: [(SharedMediaType, String)] = []
        if #available(iOS 14.0, *) {
            pairs.append(contentsOf: [
                (.image, UTType.png.identifier),
                (.image, UTType.jpeg.identifier),
                (.image, UTType.heic.identifier),
                (.image, UTType.image.identifier),
                (.video, UTType.movie.identifier),
                (.file, UTType.fileURL.identifier),
                (.url, UTType.url.identifier),
                (.text, UTType.text.identifier),
            ])
        }
        pairs.append(contentsOf: [
            (.image, "public.png"),
            (.image, "public.jpeg"),
            (.image, "public.image"),
            (.video, "public.movie"),
            (.file, "public.file-url"),
            (.url, "public.url"),
            (.text, "public.text"),
        ])
        return pairs
    }

    @discardableResult
    private func ingestLoadedItem(_ data: NSSecureCoding?, as type: SharedMediaType) -> Bool {
        switch type {
        case .text:
            if let text = data as? String, !text.isEmpty {
                sharedMedia.append(SharedMediaFile(path: text, mimeType: "text/plain", type: .text))
                return true
            }
            return false
        case .url:
            if let url = data as? URL {
                sharedMedia.append(SharedMediaFile(path: url.absoluteString, type: .url))
                return true
            }
            if let text = data as? String, !text.isEmpty {
                sharedMedia.append(SharedMediaFile(path: text, type: .url))
                return true
            }
            return false
        case .image, .file, .video:
            if let url = data as? URL {
                return ingestFileURL(url, as: type)
            }
            if let image = data as? UIImage {
                return ingestUIImage(image, as: type)
            }
            if let raw = data as? Data, !raw.isEmpty {
                return ingestRawData(raw, as: type)
            }
            if let nsData = data as? NSData, nsData.length > 0 {
                return ingestRawData(nsData as Data, as: type)
            }
            return false
        }
    }

    private func ingestFileURL(_ url: URL, as type: SharedMediaType) -> Bool {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) else {
            return false
        }

        let fileName = getFileName(from: url, type: type)
        let dest = container.appendingPathComponent(fileName)

        if !copyFile(at: url, to: dest) {
            return false
        }

        let storedPath = dest.path
        if type == .video {
            guard let videoInfo = getVideoInfo(from: dest) else { return false }
            sharedMedia.append(SharedMediaFile(
                path: storedPath,
                mimeType: dest.mimeType(),
                thumbnail: videoInfo.thumbnail,
                duration: videoInfo.duration,
                type: .video
            ))
        } else {
            sharedMedia.append(SharedMediaFile(
                path: storedPath,
                mimeType: dest.mimeType(),
                type: type == .image ? .image : .file
            ))
        }
        return true
    }

    private func ingestUIImage(_ image: UIImage, as type: SharedMediaType) -> Bool {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) else {
            return false
        }

        let dest = container.appendingPathComponent("Share-\(UUID().uuidString).png")
        guard writeTempFile(image, to: dest) else { return false }

        sharedMedia.append(SharedMediaFile(
            path: dest.path,
            mimeType: "image/png",
            type: type == .video ? .video : .image
        ))
        return true
    }

    private func ingestRawData(_ raw: Data, as type: SharedMediaType) -> Bool {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) else {
            return false
        }

        let ext = type == .video ? "mp4" : "png"
        let dest = container.appendingPathComponent("Share-\(UUID().uuidString).\(ext)")
        do {
            if FileManager.default.fileExists(atPath: dest.path) {
                try FileManager.default.removeItem(at: dest)
            }
            try raw.write(to: dest)
        } catch {
            print("Cannot write shared data: \(error)")
            return false
        }

        sharedMedia.append(SharedMediaFile(
            path: dest.path,
            mimeType: dest.mimeType(),
            type: type == .video ? .video : .image
        ))
        return true
    }

    private func markAttachmentProcessed() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.processedAttachments += 1
            if self.processedAttachments >= self.pendingAttachments {
                self.finalizeShareIfNeeded()
            }
        }
    }

    private func finalizeShareIfNeeded() {
        guard !didRedirect else { return }
        guard !sharedMedia.isEmpty else {
            dismissWithError()
            return
        }
        saveAndRedirect()
    }

    // MARK: - IDs & redirect

    private func loadIds() {
        let shareExtensionAppBundleIdentifier = Bundle.main.bundleIdentifier!

        if let hostId = Bundle.main.object(forInfoDictionaryKey: kHostAppBundleIdentifierKey) as? String,
           !hostId.isEmpty {
            hostAppBundleIdentifier = hostId
        } else if shareExtensionAppBundleIdentifier.hasSuffix(".ShareExtension") {
            hostAppBundleIdentifier = String(
                shareExtensionAppBundleIdentifier.dropLast(".ShareExtension".count)
            )
        } else if let lastIndexOfPoint = shareExtensionAppBundleIdentifier.lastIndex(of: ".") {
            hostAppBundleIdentifier = String(shareExtensionAppBundleIdentifier[..<lastIndexOfPoint])
        } else {
            hostAppBundleIdentifier = shareExtensionAppBundleIdentifier
        }

        let customAppGroupId = Bundle.main.object(forInfoDictionaryKey: kAppGroupIdKey) as? String
        appGroupId = customAppGroupId ?? "group.\(hostAppBundleIdentifier)"
    }

    private func saveAndRedirect(message: String? = nil) {
        guard !didRedirect else { return }
        guard !sharedMedia.isEmpty else {
            dismissWithError()
            return
        }
        didRedirect = true

        let userDefaults = UserDefaults(suiteName: appGroupId)
        userDefaults?.set(toData(data: sharedMedia), forKey: kUserDefaultsKey)
        userDefaults?.set(message, forKey: kUserDefaultsMessageKey)
        userDefaults?.synchronize()
        redirectToHostApp()
    }

    private func redirectToHostApp() {
        loadIds()
        guard let url = URL(string: "\(kSchemePrefix)-\(hostAppBundleIdentifier):share") else {
            extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        let complete: () -> Void = { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }

        // iOS 18+: extensionContext.open often fails; UIApplication via responder chain works.
        if #available(iOS 18.0, *) {
            var responder: UIResponder? = self
            while let current = responder {
                if let application = current as? UIApplication {
                    application.open(url, options: [:], completionHandler: nil)
                    complete()
                    return
                }
                responder = current.next
            }
        }

        if let context = extensionContext {
            context.open(url, completionHandler: { [weak self] success in
                if !success {
                    self?.openHostAppViaResponderChain(url)
                }
                complete()
            })
            return
        }

        openHostAppViaResponderChain(url)
        complete()
    }

    private func openHostAppViaResponderChain(_ url: URL) {
        let selectorOpenURL = sel_registerName("openURL:")
        var responder: UIResponder? = self
        while let current = responder {
            if let application = current as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                return
            }
            if current.responds(to: selectorOpenURL) {
                _ = current.perform(selectorOpenURL, with: url)
                return
            }
            responder = current.next
        }
    }

    private func dismissWithError() {
        print("[ShareExtension] Error loading shared content")
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    private func getFileName(from url: URL, type: SharedMediaType) -> String {
        var name = url.lastPathComponent
        if name.isEmpty {
            switch type {
            case .image:
                name = UUID().uuidString + ".png"
            case .video:
                name = UUID().uuidString + ".mp4"
            case .text:
                name = UUID().uuidString + ".txt"
            default:
                name = UUID().uuidString
            }
        }
        return "Share-\(name)"
    }

    private func writeTempFile(_ image: UIImage, to dstURL: URL) -> Bool {
        do {
            if FileManager.default.fileExists(atPath: dstURL.path) {
                try FileManager.default.removeItem(at: dstURL)
            }
            guard let pngData = image.pngData() else { return false }
            try pngData.write(to: dstURL)
            return true
        } catch {
            print("Cannot write to temp file: \(error)")
            return false
        }
    }

    private func copyFile(at srcURL: URL, to dstURL: URL) -> Bool {
        let access = srcURL.startAccessingSecurityScopedResource()
        defer {
            if access {
                srcURL.stopAccessingSecurityScopedResource()
            }
        }
        do {
            if FileManager.default.fileExists(atPath: dstURL.path) {
                try FileManager.default.removeItem(at: dstURL)
            }
            try FileManager.default.copyItem(at: srcURL, to: dstURL)
        } catch {
            print("Cannot copy item at \(srcURL) to \(dstURL): \(error)")
            return false
        }
        return true
    }

    private func getVideoInfo(from url: URL) -> (thumbnail: String?, duration: Double)? {
        let asset = AVAsset(url: url)
        let duration = (CMTimeGetSeconds(asset.duration) * 1000).rounded()
        let thumbnailPath = getThumbnailPath(for: url)

        if FileManager.default.fileExists(atPath: thumbnailPath.path) {
            return (thumbnail: thumbnailPath.path, duration: duration)
        }

        var saved = false
        let assetImgGenerate = AVAssetImageGenerator(asset: asset)
        assetImgGenerate.appliesPreferredTrackTransform = true
        assetImgGenerate.maximumSize = CGSize(width: 360, height: 360)
        do {
            let img = try assetImgGenerate.copyCGImage(
                at: CMTimeMakeWithSeconds(0, preferredTimescale: 1),
                actualTime: nil
            )
            try UIImage(cgImage: img).pngData()?.write(to: thumbnailPath)
            saved = true
        } catch {
            saved = false
        }

        return saved ? (thumbnail: thumbnailPath.path, duration: duration) : nil
    }

    private func getThumbnailPath(for url: URL) -> URL {
        let fileName = Data(url.lastPathComponent.utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "==", with: "")
        return FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupId)!
            .appendingPathComponent("\(fileName).jpg")
    }

    private func toData(data: [SharedMediaFile]) -> Data {
        let encodedData = try? JSONEncoder().encode(data)
        return encodedData!
    }
}

extension URL {
    func mimeType() -> String {
        if #available(iOS 14.0, *) {
            if let mimeType = UTType(filenameExtension: self.pathExtension)?.preferredMIMEType {
                return mimeType
            }
        } else {
            if let uti = UTTypeCreatePreferredIdentifierForTag(
                kUTTagClassFilenameExtension,
                self.pathExtension as NSString,
                nil
            )?.takeRetainedValue() {
                if let mimetype = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
                    return mimetype as String
                }
            }
        }
        return "application/octet-stream"
    }
}
