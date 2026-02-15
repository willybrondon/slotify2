/**
 * QR code generation with rounded corners (matches customer app share link style)
 * Uses qr-code-styling for rounded finder patterns
 */
(function() {
    function loadQRCodeStyling(callback) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.0/lib/qr-code-styling.common.js';
        script.async = false;
        script.onload = callback;
        script.onerror = function() { callback(null); };
        document.head.appendChild(script);
    }

    function generateWithFallback() {
        loadQRCodeStyling(function() {
            var QRCodeStyling = window.QRCodeStyling;
            if (QRCodeStyling) {
                generateStyledQR(QRCodeStyling);
            } else {
                generateFallbackQR();
            }
        });
    }

    function generateStyledQR(QRCodeStyling) {
        var customerQR = document.getElementById('qr-customer-top');
        var expertQR = document.getElementById('qr-expert-top');

        var baseOptions = {
            width: 128,
            height: 128,
            margin: 0,
            qrOptions: { errorCorrectionLevel: 'H' },
            dotsOptions: { color: '#111', type: 'rounded' },
            cornersSquareOptions: { color: '#111', type: 'extra-rounded' },
            cornersDotOptions: { color: '#111', type: 'dot' },
            backgroundOptions: { color: '#fff' },
            image: 'images/logo.png',
            imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 8 }
        };

        if (customerQR) {
            var customerOpts = Object.assign({}, baseOptions, { data: 'https://skedisy.com/#download-customer' });
            new QRCodeStyling(customerOpts).append(customerQR);
        }
        if (expertQR) {
            var expertOpts = Object.assign({}, baseOptions, { data: 'https://skedisy.com/#download-expert' });
            new QRCodeStyling(expertOpts).append(expertQR);
        }
    }

    function generateFallbackQR() {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = function() {
            var customerQR = document.getElementById('qr-customer-top');
            var expertQR = document.getElementById('qr-expert-top');
            if (customerQR) new QRCode(customerQR, { text: 'https://skedisy.com/#download-customer', width: 128, height: 128, colorDark: '#111', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.H });
            if (expertQR) new QRCode(expertQR, { text: 'https://skedisy.com/#download-expert', width: 128, height: 128, colorDark: '#111', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.H });
        };
        document.head.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generateWithFallback);
    } else {
        generateWithFallback();
    }
})();
