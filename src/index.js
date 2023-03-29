import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {ReactComponent as Piece1} from './svg//piece1.svg'
import {ReactComponent as Piece2} from './svg/piece2.svg'
import {ReactComponent as AncientJar} from './svg/ancient-jar.svg'
import {ReactComponent as DiceYes} from './svg/dice_yes.svg'
import {ReactComponent as DiceNo} from './svg/dice_no.svg'

class RoyalGameOfUr extends React.Component {
// functionality to add: 
// 1. next player if you don't have any moves - forfeit turn button? but checks if you have moves
// 2. can't actually go home. lol. 


    constructor(props){
        super(props);
        this.state = {
            player1: [6, 6, 6, 6, 6],
            player2: [8, 8, 8, 8, 8],
            red: null,
            turn: 1, 
            tileNum: null,
            roll: null,
            rollNeeded: true,
            tip: null, 
            message: null, 
            error: null
        }
    }

    rosettes = [0, 2, 10, 18, 20];
    nullTiles = [6, 8, 9, 11];

    diceRoll() {
        if(this.state.rollNeeded){
            let roll= Math.floor(Math.random() * 5)

            if(roll === 0){
                let turn = this.state.turn
                return this.setState({ roll: roll, message: "You rolled a 0. Next player's turn." }, 
                    () => {
                        this.nextTurn(turn === 1 ? 2 : 1)
                    })}

            if(this.state.error === "Roll the dice first!"){
                this.setState({ error: null, roll: roll})}

            this.setState({ roll: roll, rollNeeded: false, message: null  })
        }
    }

    diceDisplay(){
        const roll = this.state.roll;
        if(roll === 0){
            return (
                <div className="clickable opaque">
                    <DiceNo /> 
                    <DiceNo /> 
                    <DiceNo /> 
                    <DiceNo /> 
                </div>
            )
        } else if (roll !== null){
            let diceArray = []
            for(let i = roll; i > 0; i--){
                diceArray.push(<DiceYes />)
            }
            for(let i = 4 - roll; i > 0; i--){
                diceArray.push(<DiceNo />)
            }
            return diceArray;
        } else {
            return(
            <div className="opaque clickable">
                { Math.round(Math.random()) === 1 ? <DiceYes /> : <DiceNo />}
                { Math.round(Math.random()) === 1 ? <DiceYes /> : <DiceNo />}
                { Math.round(Math.random()) === 1 ? <DiceYes /> : <DiceNo />}
                { Math.round(Math.random()) === 1 ? <DiceYes /> : <DiceNo />}
            </div>
            )
        }
    }

    nextTurn(turn){
        this.setState({ error: null, rollNeeded: true, red: null, turn: turn, tileNum: null })
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
            } else if (i === 12){
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
            else if (i === 14){
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
        let playerArray = this.state["player".concat(player)];
        let otherPlayer = player === 1 ? 2 : 1;
        let otherPlayerArray = this.state["player".concat(otherPlayer)]


        if(playerArray.includes(potentialResult)){
            this.setState({ tip: "You cannot put two of your own tiles on the same spot."})
        } else if ( this.rosettes.includes(potentialResult) && otherPlayerArray.includes(potentialResult)) {
            this.setState({ tip: "You cannot take a piece that is on a rosette"})
        } else {
            this.setState({ red: potentialResult, tileNum: tileNum, 
            tip: "Press on null squares to clear potential tile move."})
        }
       
    }

    checkMoves(i) {
        let { roll, turn, rollNeeded } = this.state
        if( rollNeeded ) {
            this.setState({error: "Roll the dice first!"})
        } else {
            let playerArray = this.state["player".concat(turn)];
            if(playerArray.includes(i)){
                this.resultOfTileMove(i, roll, turn)
            } 
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
        let onRosette = this.rosettes.includes(red);

        let newState = { tip: null }
        newState["player".concat(turn)] = playerArray;
        newState["player".concat(otherPlayer)] = otherPlayerArray;

        if(kickOut !== -1 ){
            let home = otherPlayer === 1 ? 6: 8;
            otherPlayerArray[kickOut] = home;
            this.setState(newState, () => this.nextTurn(otherPlayer))
        } else {
            if(onRosette) { newState.tip = "Landing on a rosette gives you an additional move."}
            let nextPlayer = onRosette ? turn : otherPlayer;
            this.setState(newState, () => this.nextTurn(nextPlayer))
        }        
    }

    renderSquare(i) {
        const {player1, player2, red } = this.state
        const isPotentialMove = red === i 
        const isRosette = this.rosettes.includes(i)

        const className  = ()  => {
            if(isPotentialMove && isRosette) {
                return "red rosette"
            } else if (isPotentialMove) {
                return "red"
            } else if (isRosette) {
                return "rosette"
            } 
        } 
    
        return ( <td id={i} onClick={ isPotentialMove ? () => this.move() : () => this.checkMoves(i)} 
        className = { className()}
        >
            {player1.includes(i)? <div className="container"><Piece1 className = "clickable"/></div> : null}
            {player2.includes(i)? <div className="container"><Piece2 className = "clickable"/></div> : null}

        </td>)
    }

    renderNullSquare(i) {
        return ( <td className="null" id={i} onClick={() => this.setState({ red: null, tip: null })}></td>)
    }

    renderHome(player) {
        let homeArray = []
        for(let i = 0;  i < this.state[player].length ; i++){
            let value = this.state[player][i];
            if ( value === 6) {
                homeArray.push(<Piece1 className="clickable" />)
            } else if (value === 8) {
                homeArray.push(<Piece2 className="clickable" />)
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

    render() {
        const { error, message, turn, rollNeeded, tip } = this.state
        return (
            <div className = "game">
                { tip ? <div className="tip"> {tip}</div>  : null } 
                <div className="accessory">
                    <div className="playerTurn">
                        { message ? <> {message} <br /></> : null }
                         Player {turn}, it's your turn.  
                        {rollNeeded ? " Please roll the dice. " : " Please make a move. " }
                    </div>
                    { error ? <div className="error"> { error } </div> : null }
                    <div className={`dice ${rollNeeded ? "clickable" : ""}`}
                        onClick={ rollNeeded ? () => this.diceRoll() : null}>
                        {this.diceDisplay()}
                    </div>                       
                </div>
                <div className="main">
                    <div className="player1" onClick={() => this.checkMoves(6)}>
                        <div>
                            {this.renderHome("player1")}
                        </div>
                    </div>
                    <div className="board">
                        <table id="board">
                            <thead />
                            <tbody>
                            {this.renderTable()}
                            </tbody>
                        </table>
                    </div>
                    <div className="player2" onClick={() => this.checkMoves(8)}>
                        {this.renderHome("player2")}
                    </div>
                </div>           
            </div>
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
        this.setState({game: e.target.value})
    }

    render(){
        return (
            <div className = "wrapper">
                <div className = "header">
                    <AncientJar /> Ancient Games 
                </div>
                <div className = "selectGame">
                    <label htmlFor="games">Choose a Game:</label>
                    <select name="games" id = "games" onChange= {(e) => this.changeGame(e)} value={this.state.game}>
                        <option value="Royal Game of Ur">Royal Game of Ur</option>
                        <option value="Senet">Senet</option>
                        <option value="Chess">Chess</option>
                    </select>
                </div>
                
                {this.state.game === "Royal Game of Ur" ? <RoyalGameOfUr /> : <div className="sorry"> We don't have {this.state.game} yet!</div>}  
            </div> 
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />)