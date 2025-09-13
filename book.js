// Book logic for Potatobean
window.startBookViewer = function startBookViewer() {
    const bookView = document.getElementById('bookView');
    if (!bookView) return;
    // Dynamically find all JPEGs in the workspace and extract book name and page numbers
    let allJpegs = [
        'bodie squad book1-0.jpg',
        'bodie squad book1-1.jpg',
        'bodie squad book1-2.jpg',
        'bodie squad book1-3.jpg',
        'bodie squad book1-4.jpg',
        'bodie squad book1-5.jpg'
    ];
    // Parse book name and page numbers
    let bookPages = [];
    let bookTitle = '';
    allJpegs.forEach(filename => {
        // Match pattern: bookname-pagenum.jpg
        let match = filename.match(/^(.*)-(\d+)\.jpg$/i);
        if (match) {
            let name = match[1];
            let pageNum = parseInt(match[2], 10);
            if (!bookTitle) bookTitle = name;
            bookPages[pageNum] = filename;
        }
    });
    let currentPage = 0;
    let pages = [];
    let loaded = 0;
    let totalPages = bookPages.length;
    for(let i=0;i<bookPages.length;i++) {
        if (bookPages[i]) {
            let img = new window.Image();
            img.src = bookPages[i];
            img.onload = () => { loaded++; pages[i] = img; };
            img.onerror = () => {};
        }
    }
    // Add title and page number display
    // Move header to top of menu overlay
    let menuOverlay = document.getElementById('menuOverlay');
    let bookHeader = document.createElement('div');
    bookHeader.id = 'bookHeader';
    bookHeader.style.textAlign = 'center';
    bookHeader.style.fontFamily = 'Quicksand, Arial, sans-serif';
    bookHeader.style.fontSize = '1.5em';
    bookHeader.style.fontWeight = 'bold';
    bookHeader.style.margin = '30px 0 0 0';
    bookHeader.style.color = '#ffe066';
    bookHeader.style.textShadow = '0 2px 8px #000a';
    // Insert at top of menu overlay
    if (menuOverlay && menuOverlay.firstChild) {
        menuOverlay.insertBefore(bookHeader, menuOverlay.firstChild.nextSibling);
    }
    function showPages() {
        // Update header
        let totalPages = pages.filter(Boolean).length;
        let pageDisplay = '';
        if(currentPage === 0) {
            pageDisplay = `Page 1 of ${totalPages}`;
        } else {
            let leftNum = currentPage;
            let rightNum = currentPage+1 <= totalPages ? currentPage+1 : '';
            pageDisplay = `Pages ${leftNum}` + (rightNum ? `-${rightNum}` : '') + ` of ${totalPages}`;
        }
        bookHeader.innerHTML = `${bookTitle}<div style='font-size:0.6em;font-weight:normal;margin-top:0.2em;'>${pageDisplay}</div>`;
        bookView.innerHTML = '';
        // Calculate max image size (window size - 50px from each edge)
        let maxW = Math.max(100, window.innerWidth - 100);
        let maxH = Math.max(100, window.innerHeight - 180); // account for header/menu
        if(currentPage === 0) {
            // Show first page only
            let img = pages[0] || document.getElementById('bookPage0');
            img.style.maxHeight = maxH + 'px';
            img.style.maxWidth = maxW + 'px';
            img.style.boxShadow = '0 4px 32px #0006';
            img.style.borderRadius = '8px';
            img.style.transition = 'box-shadow 0.3s';
            img.style.position = 'relative';
            img.style.zIndex = '2';
            img.className = 'book-single';
            bookView.appendChild(img);
        } else {
            // Show two pages
            let left = pages[currentPage-1];
            let right = pages[currentPage];
            if(left) {
                left = left.cloneNode();
                left.style.maxHeight = maxH + 'px';
                left.style.maxWidth = (maxW/2 - 10) + 'px';
                left.style.marginRight = '2vw';
                left.style.boxShadow = '0 4px 32px #0006';
                left.style.borderRadius = '8px 0 0 8px';
                left.style.position = 'relative';
                left.style.zIndex = '2';
                left.className = 'book-left';
                bookView.appendChild(left);
            }
            if(right) {
                right = right.cloneNode();
                right.style.maxHeight = maxH + 'px';
                right.style.maxWidth = (maxW/2 - 10) + 'px';
                right.style.marginLeft = '2vw';
                right.style.boxShadow = '0 4px 32px #0006';
                right.style.borderRadius = '0 8px 8px 0';
                right.style.position = 'relative';
                right.style.zIndex = '2';
                right.className = 'book-right';
                bookView.appendChild(right);
            }
        }
    }
    function curlAnimation() {
        // Animate the right page curling open
        let rightImg = bookView.querySelector('.book-right');
        if(rightImg) {
            rightImg.style.transition = 'box-shadow 0.3s, transform 0.7s cubic-bezier(.77,0,.18,1)';
            rightImg.style.transform = 'rotateY(-90deg)';
            setTimeout(() => {
                rightImg.style.transform = 'rotateY(0deg)';
            }, 30);
        }
    }
    bookView.onclick = function() {
        // If first page, go to 2-page view
        if(currentPage === 0) {
            currentPage = 2;
            showPages();
            curlAnimation();
        } else {
            // Advance by 2 pages
            currentPage += 2;
            showPages();
            curlAnimation();
        }
    };
    // Initial show
    setTimeout(showPages, 200);
}
