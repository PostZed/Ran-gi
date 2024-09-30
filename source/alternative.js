import Phaser from './phaser.js'  ;
import {EM,B,NMO,SQ,GREEN,RED,BLUE,YELLOW,R,A,Y,G,arrayToGrid ,Sticker, colorNames, colorNumbers
,makeHintArrays} from './utils.js' ;
const WHITE = 0xffffff ;
import {NONE, OPTIONS_SHOWING,PALETTE_SHOWING,RADIOS_SHOWING,NOTIF_SHOWING} from 
'./AC.js';
let colors = [YELLOW,GREEN,RED,BLUE] ;
let allColors = [YELLOW,GREEN,RED,BLUE,WHITE]
const colorsCopy = colors ;

class BS{
    constructor(scene,cols,rows,w,h,OX,OY , arr){
    this.scene = scene ;
this.cols = cols ;
this.rows = rows ;
this.w = w ;
this.h = h ;
this.OX = OX ;
this.OY = OY ;
this.stickers = [] ;
this.others = [];
this.grid = this.create(cols , rows) ;
this.mfj(arr)

}

/** make from json */
mfj(arr){
    const w = this.w ;
    const h = this.h ;
    const OX = this.OX ;
    const OY = this.OY ;
    const num = 0 ;

arr.forEach(item=>{
const index = colorsCopy.indexOf(item.color) ;
item.color = colors[index] ;
});

    for(let deets of arr){
        const {isClueSquare , col ,row , hint , color , count } = deets ;

        const tile = new Tile(this.scene, w*col+OX, h*row+OY,w,h,WHITE,col,row,num,this ) ;
        if(isClueSquare){
          switch(hint){
            case B:
                tile.num.text = count ;
                tile.fillColor = tile.color = color ;
                tile.count = count ; 
                tile.setClue(B) ;
           break;
           case NMO:
            tile.num.text = count ;
            tile.count = count ;
            tile.setClue(NMO) ;
            break;

            case SQ:
                tile.fillColor = tile.color = color ;
                tile.setClue(SQ) ;

          }
        }

        else{
            tile.setClue(EM) ;
        }
        tile.color = color ;
        tile.currentIndex = colors.indexOf(tile.fillColor) ;
        this.grid[col][row] = tile ;
    }

   
}

create(cols,rows){
let grid = [] ;
    for(let i=0; i<cols; i++){
    grid[i] = [] ;
    for(let k=0; k<rows; k++){
    grid[i][k] = undefined ;
 }
    }
    return grid ;
}


changePalette(nuPalette){
const isNotNew = nuPalette.every(item=>colors.indexOf(item) !== -1) ;
if(isNotNew)
return ; 

let squareList = this.gridToArray(this.grid) ;

colors.forEach((item,index) =>{
const nuColor = nuPalette[index] ;
const mySquares = squareList.filter(square =>square.color === item ) ;
mySquares.forEach(sq =>{
sq.color = nuColor ;

sq.allColors = [] ;
nuPalette.forEach(cor=>sq.allColors.push(cor)) ;
sq.allColors.push(WHITE) ; 

if(sq.hint === SQ || sq.hint === B){
    sq.fillColor = nuColor ;
}
if(sq.hint === EM || sq.hint === NMO){
    if(sq.fillColor !== WHITE){
    const i = colors.indexOf(sq.fillColor) ;
    sq.fillColor = nuPalette[i] ;
    }
}
}) ;
squareList = squareList.filter((square)=>{
    return mySquares.indexOf(square) === -1 ;
});
}) ;

colors = nuPalette ;
allColors = this.grid[0][0].allColors ;
}


boardIsFilled(){
    for( let i = 0 ; i< this.cols ; i++){
        for(let k=0; k<this.rows; k++){
    const sq = this.grid[i][k];
    if(sq.fillColor === WHITE)
    return false;
        }
    }
    return true;
}

isCorrect(){
    for( let i = 0 ; i< this.cols ; i++){
        for(let k=0; k<this.rows; k++){
    const sq = this.grid[i][k];
    if(sq.fillColor !== sq.color)
    return false;
        }
    }
    return true;
}

gridToArray(grid){
    const list = [] ;
    for(let i = 0 ; i<this.cols ; i++){
        for(let k = 0 ; k<this.rows ; k++){
  const sq =  grid[i][k] ;
  list.push(sq) ;        
        } 
}
return list ;
}

}

class Tile extends Phaser.GameObjects.Rectangle{
    constructor(scene,x,y,w,h,color,col,row,pos,board){
        super(scene,x,y,w,h,color) ;
        /** @type Phaser.Scene */
        this.scene = scene ;
        this.setOrigin(0) ;
        this.w = w ;
        this.h = h ;
        this.allColors = allColors ;
        scene.add.existing(this) ;
        this.color = color ;
        this.col = col ;
        this.row = row ;
        this.board = board ;
        this.num = this.scene.add.text(x,y,'',{color:"#000000" , fontSize: `${w}px`}).setOrigin(0) ;
        const f = 0.7;
        this.dot = this.scene.add.circle(x+ f * w, y+f * w, w/12, 0x000000).setOrigin(0).setVisible(false);
    //this.dot.setStrokeStyle(w/20,0x000000);
        this.pos = pos ;
        this.setStrokeStyle(1,0x000000) ;
        this.setInteractive() ;
      //  this.on('pointerover' , ()=>{this.showCoords(board.msg);
     //  }) ;
     
     this.on('pointerdown' , (e)=>{
        if(this.hint === SQ || this.hint === B || scene.menuState !== NONE )
        return ; 
    
if(scene.currentMenus){
    const {menuDiv , func, args} = scene.currentMenus ;

    if(scene.isWithinNode(menuDiv , e.event.clientX , e.event.clientY) )
      return;
 
    scene.currentMenus = undefined;
    scene.menuState = NONE;
    menuDiv.style.visibility = 'hidden' ;
    if(func){
     func(args) ;
    }
    return;

}

        this.changeColor() ;
        }) ;
     
    }


    changeColor(){
        if(this.currentIndex === 4){
           this.currentIndex = 0 ;
           const color = this.allColors[0] ;
           this.setFillStyle(color) ;

        }
       
        else{
           const i = this.currentIndex+ 1 ;
           const color = this.allColors[i] ;
        this.setFillStyle(color) ;
        this.currentIndex++ ;
 
     }
           }



setClue(num){

const hint = num === undefined ? Math.floor(Math.random() * 4) : num ;
switch(hint){
    case 3:
this.hint = SQ ;
this.setFillStyle(this.fillColor) ;
this.num.setVisible(false) ;
this.dot.setVisible(true) ;
break;
case 1:
this.hint = NMO ;
this.num.setVisible(true) ;
this.setFillStyle(0xffffff) ;
break;
case 0:
this.hint = EM ;
this.num.setVisible(false) ;
this.setFillStyle(0xffffff) ;
break ;
case 2:
this.hint = B ;
this.num.setVisible(true) ;
this.setFillStyle(this.fillColor) ;
this.dot.setVisible(true) ;
}
    }


} // end of class Tile




export {BS, Tile } ;