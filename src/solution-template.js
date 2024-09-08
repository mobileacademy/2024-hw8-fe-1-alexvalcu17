/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let gameOverFlag = false;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;


/* 
*
* added declaration of difficulties in order to use them in the new startGame function
*
 */
const difficulties = {
    easy: {rowCount: 9, colCount: 9},
    medium: { rowCount: 16, colCount: 16},
    hard: {rowCount: 16, colCount: 30}
};


/*
*
* function triggered by the "Start Game" button
*
 */ 
function startGame() {
    gameOverFlag = false;
    bombCount = 0;
    const difficulty = document.getElementById("difficulty").value;
    bombProbability = parseInt(document.getElementById("bombProbability").value);
    maxProbability = parseInt(document.getElementById("maxProbability").value);
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";
    minesweeperGameBootstrapper(difficulties[difficulty].rowCount, difficulties[difficulty].colCount);
}


function minesweeperGameBootstrapper(rowCount, colCount) {
    let easy = {
        'rowCount': 9,
        'colCount': 9,
    };
    // TODO you can declare here the medium and expert difficulties
    let medium = {
        'rowCount': 16,
        'colCount': 16,
    };
    let hard = {
        'rowCount': 16,
        'colCount': 30,
    };
    
    if (rowCount == null && colCount == null) {
        // TODO have a default difficulty
        rowCount = easy.rowCount;
        colCount = easy.colCount;
    } 
        generateBoard({'rowCount': rowCount, 'colCount': colCount});
        renderBoard(rowCount, colCount);
}


function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    /*
    *
    * "generate" an empty matrix
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        board[i] = new Array(boardMetadata.colCount);
    }
    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }
    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }
    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */
    openedSquares = [];
    flaggedSquares = [];
    squaresLeft = boardMetadata.rowCount * boardMetadata.colCount;

    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS
    /*
    *
    * TODO count the bombs around each square
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            if (!board[i][j].hasBomb) {
                let bombCountAdjacent = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) continue; 
                        let newRow = i + x;
                        let newCol = j + y;
                        if (newRow >= 0 && newRow < boardMetadata.rowCount &&
                            newCol >= 0 && newCol < boardMetadata.colCount) {
                            if (board[newRow][newCol].hasBomb) {
                                bombCountAdjacent++;
                            }
                        }
                    }
                }
                board[i][j].bombsAround = bombCountAdjacent;
            }
        }
    }
    /*
    *
    * print the board to the console to see the result
    *
    */
    console.log("Board generated");
    console.log(board);
}

/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
        this.isOpened = false;
        this.isFlagged = false;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
// minesweeperGameBootstrapper(5, 5);


// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

function renderBoard(rowCount, colCount) {
    const gameBoard = document.getElementById("gameBoard");
    const table = document.createElement("table");
    for (let i = 0; i < rowCount; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < colCount; j++) {
            const cell = document.createElement("td");
            cell.classList.add("closed");
            cell.setAttribute("data-row", i);
            cell.setAttribute("data-col", j);
            cell.addEventListener("click", () => trySquare(i, j));
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                flagSquare(i, j);
            });
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    gameBoard.appendChild(table);
}


function flagSquare(row, col) {
    if (gameOverFlag || openedSquares.includes(`${row}-${col}`)) {
        return;
    }
    const cell = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    const squareId = `${row}-${col}`;
    if (flaggedSquares.includes(squareId)) {
        flaggedSquares = flaggedSquares.filter(id => id !== squareId);
        cell.classList.remove("flagged");
    } else {
        flaggedSquares.push(squareId);
        cell.classList.add("flagged");
    }
}


function trySquare(row, col) {
    const square = board[row][col];
    if (gameOverFlag || square.isOpened || square.isFlagged) {
        return;
    }
    const cell = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    square.isOpened = true;
    openedSquares.push(`${row}-${col}`);
    cell.classList.remove("closed");
    cell.classList.add("opened");
    squaresLeft--;
    if (square.hasBomb) {
        cell.classList.add("bomb");
        gameOver(false); 
        return;
    }
    if (square.bombsAround > 0) {
        cell.innerHTML = square.bombsAround;
    } else {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                let newRow = row + x;
                let newCol = col + y;
                if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
                    if (!board[newRow][newCol].isOpened) {
                        trySquare(newRow, newCol);
                    }
                }
            }
        }
    }
    if (squaresLeft === bombCount) {
        gameOver(true);
    }
}


function gameOver(hasWon) {
    gameOverFlag = true;
    if (!hasWon) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j].hasBomb) {
                    const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
                    cell.classList.add("bomb");
                }
            }
        }
        alert("Game Over! You hit a bomb :/");
    } else {
        alert("Congratulations! You won!");
    }
}