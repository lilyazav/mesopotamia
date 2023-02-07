import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


class RoyalGameOfUr extends React.Component {
// functionality to add: 
// 1. unselect tile move 
// 2. tile can't go where own piece is
// 3. tile can't take another on rosette
// 4. next player if you don't have any moves
// 5. can't actually go home. lol. 

// not working on player 1 when on middle row, second to last

    constructor(props){
        super(props);
        this.state = {
            player1: [6, 6, 6, 6, 6],
            player2: [8, 8, 8, 8, 8],
            red: null,
            turn: 1, 
            tileNum: null,
            roll: null,
            error: null
        }
    }


    rosettes = [0, 2, 10, 18, 20];
    nullTiles = [6, 8, 9, 11];

    nextTurn(turn){
        this.setState({ roll: null, error: null, red: null, turn: turn, tileNum: null})
    }
        
    // where a tile goes if it moves 1 space
    tileStep(i, player){
        const rem = i % 3;
        // tile in the first row
        if (i === 6){
            return 3;
        } else if (i == 8){
            return 5;
        } else if (rem === 0) {
            if( i === 0){
                return 1;
            } else if (i === 18){
                return 101;
            } else {
                return i - 3;
            }
        // tile in the second row, player 1 
        } else if (rem === 1 & player === 1) {
            return (i === 22 ? 21 : i + 3);
        // tile in the second row, player 2
        } else if (rem === 1 & player === 2) {
            return (i === 22 ? 23 : i + 3);
        // else tile in the third row
        } else  {
            if( i === 2){
                return 1;
            } else if (i === 101 ){
                return false;
            } 
            else if (i === 20){
                return 101;
            } else {
                return i - 3;
            }
        } 
    }

    // where a tile goes if it moves X spaces
    tileMove(start, roll, player){
        let i = start;
        for( ; i < 100 && roll > 0 ; roll --){
            i = this.tileStep(i, player)
        }

        return i; 
    }

    resultOfTileMove(tileNum, roll, player){
        let potentialResult = this.tileMove(tileNum, roll, player);
        this.setState({ red: potentialResult, tileNum: tileNum})
    }

    checkMoves(i) {
        let { roll, turn } = this.state
        if( roll !== null){
            let playerArray = this.state["player".concat(turn)];
            if(playerArray.includes(i)){
                this.resultOfTileMove(i, roll, turn)
            } 
        } else {
            this.setState({error: "Roll the dice first!"})
        }
        
    }

    move() {
        let { tileNum, red, turn } = this.state
        let otherPlayer = turn === 1 ? 2 : 1;

        let playerArray = this.state["player".concat(turn)]
        let otherPlayerArray = this.state["player".concat(otherPlayer)]

        let indexChange = playerArray.findIndex((i) => i === tileNum)
        playerArray[indexChange] = red;

        // are we kicking out the other player's piece
        let kickOut = otherPlayerArray.findIndex((i) => i === red)
        if(kickOut !== -1) {
            let home = otherPlayer === 1 ? 6: 8;
            otherPlayerArray[kickOut] = home;
        }

        let newState = {}
        newState["player".concat(turn)] = playerArray;
        newState["player".concat(otherPlayer)] = otherPlayerArray;

        // additional move for player?
        let isAdditionalMove = this.rosettes.includes(red);
        let nextPlayer = isAdditionalMove ? turn : otherPlayer;
        
        this.setState(newState, () => this.nextTurn(nextPlayer))
        
    }

    renderSquare(i) {
        const {player1, player2, red } = this.state
        const isPotentialMove = red === i 
    
        return ( <td id={i} onClick={ isPotentialMove ? ()=> this.move() : () => this.checkMoves(i)} 
        className = {red === i ? "red" : null}>
            {player1.includes(i)? "1" : null}
            {player2.includes(i)? "2" : null}

        </td>)
    }

    renderNullSquare(i) {
        return ( <td className="null" id={i}></td>)
    }

    renderHome(player) {
        let homeArray = []
        for(let i = 0;  i < this.state[player].length ; i++){
            let value = this.state[player][i];
            if ( value === 6) {
                homeArray.push("1")
            } else if (value === 8) {
                homeArray.push("2")
            } else if (value === 101) {
                homeArray.push("X")
            } 
        }
        return homeArray
    }

    renderTable() {
        let tbl = []
        for(let i = 0; i < 24; i+=3){
            tbl.push(
                <tr>
                    {this.nullTiles.includes(i) ? this.renderNullSquare(i) : this.renderSquare(i)}
                    {this.nullTiles.includes(i+1) ? this.renderNullSquare(i+1) : this.renderSquare(i+1)}
                    {this.nullTiles.includes(i+2) ? this.renderNullSquare(i+2) : this.renderSquare(i+2)}
                </tr>
            )
        }
        let tblList = tbl.map((i) => <>{i}</>)
        return tblList;
    }

    diceRoll() {

        if(this.state.roll === null){
            let roll= Math.floor(Math.random() * 5)

            if(roll === 0){
                let turn = this.state.turn
                // need a message or something for roll = 0
                return this.nextTurn(turn === 1 ? 2 : 1)
            }

            if(this.state.error === "Roll the dice first!"){
                this.setState({ error: null, roll: roll})
            }

            this.setState({ roll: roll })
        } else {
            this.setState({ error: "You have to go first!"})
        }

    }

    render() {
        return (
            <>
            <div className="error">{ this.state.error ? this.state.error : null }</div>
            <div className="playerTurn">Turn: Player {this.state.turn}</div>
            <div className="dice" onClick={() => this.diceRoll()}>Dice = {this.state.roll}</div>
            <div className="player1" onClick={() => this.checkMoves(6)}>
                {this.renderHome("player1")}
            </div>
            <table id="board">
                <thead />
                <tbody>
                {this.renderTable()}
                </tbody>
            </table>
            <div className="player2" onClick={() => this.checkMoves(8)}>
                {this.renderHome("player2")}
            </div>
            </>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            game: "Royal Game of Ur"
        }
    }

    changeGame(e) {
        console.log(e.target.value)
        this.setState({game: e.target.value})
    }

    render(){
        console.log(this.state.game)
        return (
            <div>
                <label htmlFor="games">Choose a Game: </label>
                <select name="games" id = "games" onChange= {(e) => this.changeGame(e)} value={this.state.game}>
                    <option value="Royal Game of Ur">Royal Game of Ur</option>
                    <option value="Senet">Senet</option>
                    <option value="Chess">Chess</option>
                </select>
                {this.state.game === "Royal Game of Ur" ? <RoyalGameOfUr /> : <div> We don't have {this.state.game} yet!</div>}  
            </div> 
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />)