var memory = new WebAssembly.Memory({
    initial: 2,
    maximum: 2,
});

var importObject = {
    env: {
        consoleLog: (arg) => console.log(arg), // Useful for debugging on zig's side
        memory: memory,
    },
};

WebAssembly.instantiateStreaming(fetch("zig-out/bin/board.wasm"), importObject).then((result) => {
    const wasmMemoryArray = new Uint8Array(memory.buffer);

    // Automatically set canvas size as defined in `checkerboard.zig`
    const checkerboardSize = result.instance.exports.getCheckerboardSize();
    const canvas = document.getElementById("board");

    // Gets size of board we are making
    canvas.width = checkerboardSize;
    canvas.height = checkerboardSize;

    const context = canvas.getContext("2d");
    const imageData = context.createImageData(canvas.width, canvas.height);

    // Function to load and render an image on a coordinate in the canvas
    const drawImageOnSquare = (imgSrc, col, row) => {
        const img = new Image();
        img.src = imgSrc;

        img.onload = () => {
            const squareSize = canvas.width / checkerboardSize;

            // Calculate the top-left corner of the square
            const posX = col * squareSize;
            const posY = row * squareSize;

            console.log("Drawing image at:", posX, posY, "with square size:", squareSize);

            // Draw the image on the calculated position, scaled to the square size
            context.drawImage(img, posX, posY, 1, 1);
        };

        img.onerror = () => {
            console.error("Failed to load image:", imgSrc);
        };
    };

    // Instantiates board
    const setBoard = () => {
        result.instance.exports.colorCheckerboard();

        const boardOffset = result.instance.exports.getCheckerboardBufferPointer();
        const imageDataArray = wasmMemoryArray.slice(
            boardOffset,
            boardOffset + checkerboardSize * checkerboardSize * 6
        );

        //Loads our imageDataArray with the rgba values from zig
        for (let j = 0, i = 0; i < checkerboardSize * checkerboardSize * 6; j += 4, i += 6) {
            imageData.data[j]     = imageDataArray[i];     // R
            imageData.data[j + 1] = imageDataArray[i + 1]; // G
            imageData.data[j + 2] = imageDataArray[i + 2]; // B
            imageData.data[j + 3] = imageDataArray[i + 3]; // A

            // Also have the x and y coords embedded in the array but dont use
            // const coordX = imageDataArray[i + 4];
            // const coordY = imageDataArray[i + 5];
        }

        context.putImageData(imageData, 0, 0);

        const coordDisplay = document.getElementById("coordDisplay");

        // Function to get coordinates based on mouse position
        const getCoordAtPosition = (x, y) => {
            // Calculates the size of each square on the board
            const screenWidth = canvas.offsetWidth;
            const squareSize = screenWidth / checkerboardSize;

            // Gets the entry in the array that we are looking for
            const col = Math.floor(x / squareSize);
            const row = Math.floor(y / squareSize);

            // Multiply by 6 to access the correct entry block in imageDataArray
            const index = (row * checkerboardSize + col) * 6; 

            // Coordinates that we want 
            const coordX = imageDataArray[index + 4]; 
            const coordY = imageDataArray[index + 5];

            // Image source (replace with your image URL or path)
            const imgSrc = './assets/blue.png';

            // Draw the image at the specific square
            drawImageOnSquare(imgSrc, col, row);
            
            return { coordX, coordY };
        };

        // Add an event listener for mouse clicks to display coordinates
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            console.log(mouseX, mouseY)

            const { coordX, coordY } = getCoordAtPosition(mouseX, mouseY);
            coordDisplay.textContent = `Click at (${coordX}, ${coordY})`;
        });

    };

    setBoard();
});