// defines the number of rows and columns for the game board
const ROWS = 6;
const COLS = 7;

// creates a 2D array to store the game state, initializing all positions as null
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// sets the starting player to red
let currentPlayer = 'red';

// makes sure that the board is created properly when the page loads
document.addEventListener("DOMContentLoaded", () => {
  createBoard();
});

/*
game board is created dynamically through the generation of cells
each cell is given a click event that allows each player to drop pieces
 */
function createBoard()
{
  // allows manipulation of board dynamically
  const boardElement = document.getElementById("board");

  // removes any existing elements inside the board before creating a new one
  // prevents duplicate elements from appearing when game is reset/reloaded
  boardElement.innerHTML = "";

  // nested for-loops makes sure each cell is created on the game board
  for (let row = 0; row < ROWS; row++)
  {
    for (let col = 0; col < COLS; col++)
    {
      const cell = document.createElement("div"); // creates new <div> element, acts as cell
      cell.classList.add("cell"); // adds "cell" class to new element, defined in CSS to have circular shape

      //dateset used to store custom attributes for each element
      // values allow JS to track position of each cell when clicked
      cell.dataset.row = row; // store row index
      cell.dataset.col = col; // store column index

      // when a cell is clicked, triggers the dropPiece() function
      // function receives column number as argument and determines where piece is placed in specific column
      cell.addEventListener("click", () => dropPiece(col));
      boardElement.appendChild(cell); // adds new cell to board container
    }
  }
}

/*
 * Handles the logic for dropping a piece into the selected column.
 * The piece will occupy the lowest "available" row in the specified column.
 * If the column is full, the function does nothing.
 */
function dropPiece(col)
{
  // iterates from the bottom-most row to the top (to find lowest empty space)
  for (let row = ROWS - 1; row >= 0; row--)
  {
    // check if current cell is empty
    if (!board[row][col])
    {

      // assign current player piece to the cell
      board[row][col] = currentPlayer;

      // animate the piece falling down the column
      animatePieceDrop(row, col, currentPlayer);

      // delay winner check slightly to allow the animation to complete
      setTimeout(() =>
      {
        // check if this move results in a winning move
        if (checkWinner(row, col))
        {
          // displays popup alert showing the winning player
          alert(`Player ${currentPlayer === 'red' ? '1' : '2'} wins!`);

          // reset the game after win
          resetGame();

          return; // stops further execution if there is a winner
        }

        /*
        if no winner, switch to the next player
        if current player is red, switch to yellow, and vice versa
         */
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';

        // update text on screen to show which players turn it is
        document.getElementById("turn-indicator").innerText =
          `Player ${currentPlayer === 'red' ? '1' : '2'}'s Turn (${currentPlayer})`;
      }, 500); // 500ms delay to sync with animation

      // stops loop and function execution to ensure only one piece is placed per turn
      return;
    }
  }
}

/*
animates game piece falling down the board. will simulate the visualization of a piece dropping by
moving it down the column until it reaches the correct row. Moves row by row until it reaches lowest available spot
 */
function animatePieceDrop(row, col, player)
{
  let tempRow = 0; // start animation from the top row
  let cell = document.querySelector(`.cell[data-row='${tempRow}'][data-col='${col}']`);

  // Ensure the piece starts with the correct color at the top by setting background directly
  cell.style.backgroundColor = player === 'red' ? 'red' : 'yellow';
  /*
  inner function handles step-by-step dropping animation
  uses a loop with setTimeout to create smoother falling effect
   */
  function dropStep()
  {
    // remove the piece from the previous temporary row (to create motion effect)
    if (tempRow > 0)
    {
      let previousCell = document.querySelector(`.cell[data-row='${tempRow - 1}'][data-col='${col}']`);
      previousCell.style.backgroundColor = ''; // reset to board color
    }

    // Ensure the current cell is correctly colored during animation
    cell.style.backgroundColor = player === 'red' ? 'red' : 'yellow';

    // if animation hasn't reached the final row, continue moving down
    if (tempRow < row)
    {
      tempRow++;
      cell = document.querySelector(`.cell[data-row='${tempRow}'][data-col='${col}']`);

      // call dropStep again after a short delay to create smooth animation
      setTimeout(dropStep, 50); // adjust timing for smooth animation
    }
    else
    {
      // once piece lands, update the board
      updateBoard();
    }
  }

  dropStep(); //start dropping animation sequence
}

/*
this function is responsible for updating the visual representation of the board on the page. It represents
an accurate depiction of the actual game state stored within the javascript board array
 */
function updateBoard()
{

  // selects all elements in the HTML that have the "cell" class
  // the forEach() will loop through each cell in the board to update its appearance
  document.querySelectorAll(".cell").forEach(cell =>
  {

    // retrieve row and column index from the cell's data attributes
    // since data attributes are stored as strings, row and col automatically convert to
    // numbers when used in calculations
    /*
    Example: <div class="cell" data-row="3" data-col="2"></div>
    row: 3
    col: 2
    we can use these values to check the board array for the corresponding game piece
     */
    const row = cell.dataset.row;
    const col = cell.dataset.col;


    /*
    rests the class of the cell by removing any existing styling
    resetting the class to "cell" means any previously added "red" or "yellow"
    will be removed and the cell is visually reset before applying any updates.
    important because old pieces could remain in the DOM even after the board state changes.
    makes sure only the correct styling is applied each time the board is updated
     */
    cell.className = "cell";

    /*
    checks if there is a piece placed at this row/column in the game state array.
    if it is null, the cell is empty, and no styling is applied
    if "red" or "yellow", means a player piece in that cell
     */
    if (board[row][col])
    {

      /*
      if board[row][col] contains "red", adds the "red" class to the cell.
      if board[row][col] contains "yellow", adds the "yellow" class
      CSS file contains styles for .red and .yellow, which change the background color of the piece
       */
      cell.classList.add(board[row][col]);
    }
  });
}

/*
checks if the final move resulted in a win by having four pieces in a row for a single color
will scan the board in four possible directions: vertical, horizontal, and both diagonal directions
row: row index last piece was placed
col: column index last piece was placed
 */
function checkWinner(row, col) {
  /*
  this is an array of arrays that stores all possible ways to check for a win
  vertical: [-1,0] means move one row up, same column while [1,0] means move one row down, same column
  horizontal: [0,-1] means move column left, same row while [0,1] means move one column right, same row
  diagonal(left to right): [-1,-1] means move diagonal top left while [1,1] means move diagonal bottom right
  diagonal(right to left): [-1,1] means move diagonal top right while [1,-1] means move diagonal bottom left
   */
  const directions = [
    [[-1, 0], [1, 0]],  // vertical
    [[0, -1], [0, 1]],  // horizontal
    [[-1, -1], [1, 1]], // diagonal (\\)
    [[-1, 1], [1, -1]]  // diagonal (/)
  ];

  // loop thorugh each direction (vertical, horizontal, diagonals) one by one
  // each direction is an array that holds two opposite movement vectors
  for (const direction of directions) {

    let count = 1; //starts with 1 because new piece that was place is already counted

    // checks for both sides of the direction (for example: above and below for vertical)
    for (const [dx, dy] of direction) {

      let r = row + dx, c = col + dy; //moves to the next cell in the given direction

      /*
      r >= 0 && r < ROWS: makes sure within row bounds (not outside of the board)
      c >= 0 && c < COLS: makes sure within the column bounds
      board[r][c] === currentPlayer: makes sure next cell contains same player piece
      ALL CONDTIONS NEED TO BE MET TO CONTINUE CHECKING IN THE SAME DIRECTION
       */
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
        count++; //increase count for every matching piece and keeps checking until empty space or diff color

        // moves further in the same direction and keeps checking until run out of matching pieces or out of bounds
        r += dx;
        c += dy;

      }
    }

    // if there are 4 or more consecutive pieces, player wins
    if (count >= 4) {

      // displays popup message announcing which player won
      alert(`Player ${currentPlayer === 'red' ? '1' : '2'} wins!`);

      // call to the resetGame() function to clear board and restart game
      resetGame();
      return;
    }
  }
}

/*
resets game board to initial state.
clears board, resets turn to player 1 (red)
*/
function resetGame() {
  // reset board state array (clear all positions)
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  // ensure first move is always player 1 (red)
  currentPlayer = 'red';

  // reset turn indicator text
  document.getElementById("turn-indicator").innerText = "Player 1's Turn (Red)";

  // reset board visually
  document.querySelectorAll(".cell").forEach(cell =>
  {
    cell.className = "cell"; // remove player color classes
    cell.style.backgroundColor = ""; // reset manually set inline background color
  });

  // update board to apply class-based styles correctly
  updateBoard();
}


