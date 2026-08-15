/**
 * QR code generation with logo embedded inside and rounded corner squares
 * Uses qr-code-styling via ES module (matches customer app share link style)
 */
(function() {
    function run() {
        import('https://cdn.skypack.dev/qr-code-styling@1.9.2')
            .then(function(module) {
                var QRCodeStyling = module.default;
                generateStyledQR(QRCodeStyling);
            })
            .catch(function(err) {
                console.warn('qr-code-styling failed to load:', err);
                generateFallbackQR();
            });
    }

    function generateStyledQR(QRCodeStyling) {
        var customerQR = document.getElementById('qr-customer-top');
        var expertQR = document.getElementById('qr-expert-top');

        var origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://skedisy.com';
        var baseOptions = {
            width: 128,
            height: 128,
            margin: 0,
            qrOptions: { errorCorrectionLevel: 'H' },
            dotsOptions: { color: '#111', type: 'rounded' },
            cornersSquareOptions: { color: '#111', type: 'extra-rounded' },
            cornersDotOptions: { color: '#111', type: 'dot' },
            backgroundOptions: { color: '#fff' },
            image: origin + '/images/logo.png',
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
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
