
const gameBoard = document.querySelector("#board")
const Player = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display");
const err = document.querySelector("#err");
const width = 8;
const socket = io();

let playerTurn = "whitePiece";
Player.textContent = "white"

// Chessboard Setup
const startPieces = [
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
]

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.innerHTML = startPiece

        cell.setAttribute("cell-id", i);
        cell.firstChild?.setAttribute("draggable", true)

        const row = Math.floor((63 - i) / 8) + 1;

        if (row % 2 === 0) {
            cell.classList.add(i % 2 == 0 ? "white" : "black");
        } else {
            cell.classList.add(i % 2 == 0 ? "black" : "white");
        }

        if (i <= 15) {
            cell.firstChild.firstChild.classList.add("blackPiece");
        }
        if (i >= 48) {
            cell.firstChild.firstChild.classList.add("whitePiece");
        }


        gameBoard.append(cell);
    });
};


createBoard();



const allCell = document.querySelectorAll("#board .cell");

allCell.forEach(cell => {
    cell.addEventListener("dragstart", dragstart);
    cell.addEventListener("dragover", dragover);
    cell.addEventListener("drop", dragdrop);
})


let startPositionId
let draggedElement

function dragstart(e) {
    startPositionId = e.target.parentNode.getAttribute("cell-id")
    draggedElement = e.target
}

function dragover(e) {
    e.preventDefault();
}

function dragdrop(e) {
    e.stopPropagation();

    const correctTurn = draggedElement.firstChild.classList.contains(playerTurn);
    const taken = e.target.classList.contains("piece");
    const valid = checkIfValid(e.target);
    const opponentTurn = playerTurn === "whitePiece" ? "blackPiece" : "whitePiece";
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentTurn);

    if (correctTurn) {
        // must check this condition
        if (takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            changePlayer();
            checkForWin();
            return
        }
        if (taken && !takenByOpponent) {
            err.textContent = "Invalid Move"
            setTimeout(() => {
                err.textContent = ""
            }, 3000);
            return
        }
        if (valid) {
            e.target.append(draggedElement);
            checkForWin();
            changePlayer();
            return
        }
    }
}

function checkIfValid(target) {
    const targetId = Number(target.getAttribute("cell-id")) || Number(target.parentNode.getAttribute("cell-id"));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    const move = 1;


    switch (piece) {
        case 'pawn':
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
            const whitestarterRow = [48, 49, 50, 51, 52, 53, 54, 55];
            if ((whitestarterRow.includes(startId) && startId + width * -2 === targetId && move== 1) ||
            starterRow.includes(startId) && startId + width * 2 === targetId  ||
                startId + width === targetId 
                || startId + width - 1 === targetId && document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild ||
                startId + width + 1 === targetId && document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild) 
    {
                return true;
            }
            move = 0;
            break;
        case "knight":
            if (
                startId + width * 2 + 1 === targetId ||
                startId + width * 2 - 1 === targetId ||
                startId + width - 2 === targetId ||
                startId + width + 2 === targetId ||
                startId - width * 2 + 1 === targetId ||
                startId - width * 2 - 1 === targetId ||
                startId - width + 2 === targetId ||
                startId - width - 2 === targetId
            ) {
                return true
            }
            break;

        case "bishop":
            if (
                // for right cross --- forward
                startId + width + 1 === targetId ||
                startId + width * 2 + 2 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild ||
                startId + width * 3 + 3 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild ||
                startId + width * 4 + 4 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild ||
                startId + width * 5 + 5 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild ||
                startId + width * 6 + 6 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 + 5}"]`).firstChild ||
                startId + width * 7 + 7 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 + 6}"]`).firstChild ||

                // for left cross --- forward
                startId + width - 1 === targetId ||
                startId + width * 2 - 2 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild ||
                startId + width * 3 - 3 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild ||
                startId + width * 4 - 4 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild ||
                startId + width * 5 - 5 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild ||
                startId + width * 6 - 6 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 - 5}"]`).firstChild ||
                startId + width * 7 - 7 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 - 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 - 6}"]`).firstChild ||

                // for right cross --- backward
                startId - width - 1 === targetId ||
                startId - width * 2 - 2 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild ||
                startId - width * 3 - 3 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild ||
                startId - width * 4 - 4 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild ||
                startId - width * 5 - 5 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild ||
                startId - width * 6 - 6 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 - 5}"]`).firstChild ||
                startId - width * 7 - 7 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 - 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 - 6}"]`).firstChild ||

                // fot left cross -- backward
                startId - width + 1 === targetId ||
                startId - width * 2 + 2 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild ||
                startId - width * 3 + 3 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild ||
                startId - width * 4 + 4 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild ||
                startId - width * 5 + 5 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild ||
                startId - width * 6 + 6 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 + 5}"]`).firstChild ||
                startId - width * 7 + 7 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 + 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 + 6}"]`).firstChild
            ) {
                return true;
            }
            break;

        case "rook":
            if (
                // moving straight forward
                startId + width === targetId ||
                startId + width * 2 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild ||
                startId + width * 3 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild ||
                startId + width * 4 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild ||
                startId + width * 5 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild ||
                startId + width * 6 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 5}"]`).firstChild ||
                startId + width * 7 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 6}"]`).firstChild ||

                // moving straight backward
                startId - width === targetId ||
                startId - width * 2 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild ||
                startId - width * 3 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild ||
                startId - width * 4 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild ||
                startId - width * 5 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild ||
                startId - width * 6 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 5}"]`).firstChild ||
                startId - width * 7 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 6}"]`).firstChild ||

                // moving left side straight
                startId + 1 === targetId ||
                startId + 2 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild ||
                startId + 3 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild ||
                startId + 4 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild ||
                startId + 5 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild ||
                startId + 6 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 5}"]`).firstChild ||
                startId + 7 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 6}"]`).firstChild ||

                // moving right side straight
                startId - 1 === targetId ||
                startId - 2 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild ||
                startId - 3 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild ||
                startId - 4 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild ||
                startId - 5 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild ||
                startId - 6 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 5}"]`).firstChild ||
                startId - 7 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 6}"]`).firstChild
            ) {
                return true
            }
            break;

        case "queen":
            if (
                // for right cross --- forward
                startId + width + 1 === targetId ||
                startId + width * 2 + 2 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild ||
                startId + width * 3 + 3 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild ||
                startId + width * 4 + 4 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild ||
                startId + width * 5 + 5 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild ||
                startId + width * 6 + 6 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 + 5}"]`).firstChild ||
                startId + width * 7 + 7 === targetId && !document.querySelector(`[cell-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 + 6}"]`).firstChild ||

                // for left cross --- forward
                startId + width - 1 === targetId ||
                startId + width * 2 - 2 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild ||
                startId + width * 3 - 3 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild ||
                startId + width * 4 - 4 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild ||
                startId + width * 5 - 5 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild ||
                startId + width * 6 - 6 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 - 5}"]`).firstChild ||
                startId + width * 7 - 7 === targetId && !document.querySelector(`[cell-id = "${startId + width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 5 - 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 - 6}"]`).firstChild ||

                // for right cross --- backward
                startId - width - 1 === targetId ||
                startId - width * 2 - 2 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild ||
                startId - width * 3 - 3 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild ||
                startId - width * 4 - 4 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild ||
                startId - width * 5 - 5 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild ||
                startId - width * 6 - 6 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 - 5}"]`).firstChild ||
                startId - width * 7 - 7 === targetId && !document.querySelector(`[cell-id = "${startId - width - 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 - 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 - 6}"]`).firstChild ||

                // fot left cross -- backward
                startId - width + 1 === targetId ||
                startId - width * 2 + 2 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild ||
                startId - width * 3 + 3 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild ||
                startId - width * 4 + 4 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild ||
                startId - width * 5 + 5 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild ||
                startId - width * 6 + 6 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 + 5}"]`).firstChild ||
                startId - width * 7 + 7 === targetId && !document.querySelector(`[cell-id = "${startId - width + 1}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[cell-id = "${startId - width * 5 + 5}"]`).firstChild && !document.querySelector(`[cell-id = "${startId + width * 6 + 6}"]`).firstChild ||

                // moving straight forward
                startId + width === targetId ||
                startId + width * 2 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild ||
                startId + width * 3 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild ||
                startId + width * 4 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild ||
                startId + width * 5 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild ||
                startId + width * 6 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 5}"]`).firstChild ||
                startId + width * 7 === targetId && !document.querySelector(`[cell-id="${startId + width}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId + width * 6}"]`).firstChild ||

                // moving straight backward
                startId - width === targetId ||
                startId - width * 2 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild ||
                startId - width * 3 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild ||
                startId - width * 4 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild ||
                startId - width * 5 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild ||
                startId - width * 6 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 5}"]`).firstChild ||
                startId - width * 7 === targetId && !document.querySelector(`[cell-id="${startId - width}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId - width * 6}"]`).firstChild ||

                // moving left side straight
                startId + 1 === targetId ||
                startId + 2 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild ||
                startId + 3 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild ||
                startId + 4 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild ||
                startId + 5 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild ||
                startId + 6 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 5}"]`).firstChild ||
                startId + 7 === targetId && !document.querySelector(`[cell-id="${startId + 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId + 6}"]`).firstChild ||

                // moving right side straight
                startId - 1 === targetId ||
                startId - 2 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild ||
                startId - 3 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild ||
                startId - 4 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild ||
                startId - 5 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild ||
                startId - 6 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 5}"]`).firstChild ||
                startId - 7 === targetId && !document.querySelector(`[cell-id="${startId - 1}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 2}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 3}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 4}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 5}"]`).firstChild && !document.querySelector(`[cell-id="${startId - 6}"]`).firstChild
            ) {
                return true
            }
            break;

        case "king":
            if (
                startId + 1 === targetId ||
                startId - 1 === targetId ||
                startId + width === targetId ||
                startId + width + 1 === targetId ||
                startId + width - 1 === targetId ||
                startId - width === targetId ||
                startId - width + 1 === targetId ||
                startId - width - 1 === targetId
            ) {
                return true
            }
            break;
        default:
            break;
    }
}


function changePlayer() {
    if (playerTurn === "blackPiece") {
        reverseIds()
        playerTurn = "whitePiece";
        Player.textContent = "white"
    } else {
        revertIds();
        playerTurn = "blackPiece"
        Player.textContent = "black"
    }
}

function reverseIds() {
    const allcells = document.querySelectorAll("#board .cell");
    allcells.forEach((cell, i) => {
        cell.setAttribute("cell-id", (width * width - 1) - i)
    })
}

function revertIds() {
    const allcells = document.querySelectorAll("#board .cell");
    allcells.forEach((cell, i) => {
        cell.setAttribute("cell-id", i)
    })
}

function restartGame() {
    // Clear the board and reset the game state
    gameBoard.innerHTML = "";
    infoDisplay.innerHTML = "";  // Clear the winner message
    
    // Reset the player turn
    playerTurn = "whitePiece";
    Player.textContent = "white";
    
    // Recreate the board and reattach event listeners
    createBoard();
    const pieces = document.querySelectorAll(".piece");
    pieces.forEach(piece => piece.addEventListener("dragstart", dragstart));

    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("dragover", dragover);
        cell.addEventListener("drop", dragdrop);
    });

    // Show the board and hide the "Play Again" button
    document.getElementById("board").classList.remove("hidden");
    document.querySelector(".turnbar").classList.remove("hidden");
    document.getElementById("playAgainButton").classList.add("hidden");
}

function checkForWin() {
    const kings = Array.from(document.querySelectorAll("#king"));

    if (!kings.some(king => king.firstChild.classList.contains("whitePiece"))) {
        infoDisplay.innerHTML = "Black Player Wins!";
        endGame();
    }
    if (!kings.some(king => king.firstChild.classList.contains("blackPiece"))) {
        infoDisplay.innerHTML = "White Player Wins!";
        endGame();
    }
}

function endGame() {
    const allCells = document.querySelectorAll(".cell");
    allCells.forEach(cell => cell.firstChild?.setAttribute("draggable", false));

    document.getElementById("board").classList.add("hidden");
    document.querySelector(".turnbar").classList.add("hidden");

    // Show the "Play Again" button
    document.getElementById("playAgainButton").classList.remove("hidden");
}
