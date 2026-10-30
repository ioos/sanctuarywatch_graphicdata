/** Shared, dependency-free viewer used by live figures and standalone HTML exports. */
export function enableFigureImageViewer(img) {
    if (!img || img.dataset.imageViewerEnabled === 'true') return;
    img.dataset.imageViewerEnabled = 'true';

    // Wrap the image so the expand icon stays in its bottom-right corner.
    const wrapper = img.ownerDocument.createElement('span');
    wrapper.style.cssText = `
        position: relative;
        display: block;
        max-width: 100%;
        vertical-align: top;
    `;

    img.replaceWith(wrapper);
    wrapper.appendChild(img);
    img.style.display = 'block';

    const expandIcon = img.ownerDocument.createElement('span');
    expandIcon.setAttribute('aria-hidden', 'true');
    expandIcon.style.cssText = `
        position: absolute;
        right: 10px;
        bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.3);
        color: rgba(255, 255, 255, 0.85);
        pointer-events: none;
    `;

    expandIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" focusable="false">
            <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>
        </svg>
    `;

    wrapper.appendChild(expandIcon);

    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', 'View image full screen');

    let activeDialog = null;

    function openViewer() {
        const source = img.currentSrc || img.src;
        if (!source || activeDialog) return;

        // Fill the outer page when rendered inside a same-origin iframe.
        let viewerWindow = img.ownerDocument.defaultView;
        try {
            while (
                viewerWindow.parent !== viewerWindow &&
                viewerWindow.parent.document
            ) {
                viewerWindow = viewerWindow.parent;
            }
        } catch {
            // Cross-origin frames use their own accessible document.
        }

        const doc = viewerWindow.document;
        const dialog = doc.createElement('dialog');
        dialog.setAttribute('aria-label', 'Full-screen image viewer');
        dialog.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            margin: 0;
            padding: 60px 20px 20px;
            border: 0;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.95);
            overflow: hidden;
        `;

        const fullImage = doc.createElement('img');
        fullImage.src = source;
        fullImage.alt = img.alt || '';
        fullImage.draggable = false;
        fullImage.style.cssText = `
            display: block;
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
            margin: auto;
            object-fit: contain;
        `;

        const closeButton = doc.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close image viewer');
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 16px;
            width: 44px;
            height: 44px;
            padding: 0;
            border: 1px solid white;
            border-radius: 50%;
            background: #222;
            color: white;
            font: 32px/1 sans-serif;
            cursor: pointer;
        `;

        const imageArea = doc.createElement('div');
        imageArea.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        `;
        imageArea.appendChild(fullImage);
        dialog.append(closeButton, imageArea);
        doc.body.appendChild(dialog);

        const previousOverflow = doc.documentElement.style.overflow;

        dialog.addEventListener('close', () => {
            doc.documentElement.style.overflow = previousOverflow;
            dialog.remove();
            activeDialog = null;

            if (img.isConnected) {
                img.focus({ preventScroll: true });
            }
        }, { once: true });

        closeButton.addEventListener('click', () => dialog.close());

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog || event.target === imageArea) {
                dialog.close();
            }
        });

        // Keep Escape from also closing a containing modal.
        dialog.addEventListener('keydown', (event) => {
            event.stopPropagation();

            if (event.key === 'Escape') {
                event.preventDefault();
                dialog.close();
            }
        });

        dialog.showModal();
        activeDialog = dialog;
        doc.documentElement.style.overflow = 'hidden';
        closeButton.focus({ preventScroll: true });
    }

    img.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openViewer();
    });

    img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            openViewer();
        }
    });
}
