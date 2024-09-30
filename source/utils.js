import Phaser from './phaser.js' ;
import {NONE, OPTIONS_SHOWING,PALETTE_SHOWING,RADIOS_SHOWING,NOTIF_SHOWING} from 
'./AC.js' ;
class Sticker extends Phaser.GameObjects.Rectangle{
    constructor(scene,x,y,w,h,color,limits,offset,num,board){
        super(scene,x,y,w,h,color) ;
        this.setOrigin(0,0) ;
      this.board = board ;
        this.limits = limits ;

       this.w = w;
       this.h = h;
       this.OX = x ;
       this.OY = y ;
       this.offset = offset ;
        this.offsetX = offset.x ;
        this.offsetY = offset.y ;
        this.scene = scene ;
      this.color = color ;
      this.setInteractive({draggable : true}) ;
      this.num = num ;
    }

    isWithinLimits(x , y){
        const {up , down, left , right} = this.limits ;
     if(y < up || y > down || x <left || x > right){
       return false ;
     }
     return true ;
    }
}

const YELLOW = 0xffff00 , GREEN = 0x00ff00 , RED = 0xff0000 , BLUE = 0x0000ff ;
const Y = 0 , G = 1 , R = 2 , A = 3 ; 
let colors = [YELLOW,GREEN,RED,BLUE] ;
const colorNums = [Y,G,R,A] ;
const EM = 0 , NMO = 1 , B = 2 , SQ = 3 ;
const guides = {
    filled : [Y,Y,Y,G,G,G,A,Y,G,G,
              R,A,A,A,R,R,A,Y,R,R,
              R,G,R,G,A,Y,Y,R,G,G,
              R,Y,Y,Y,A,G,G,R,Y,A,
              Y,A,G,G,A,Y,A,R,G,A,
              Y,G,R,R,R,R,A,R,G,A,
              Y,G,Y,G,G,G,A,R,G,A,
              A,G,A,A,Y,Y,A,Y,A,Y,
              A,G,Y,G,G,G,A,G,G,Y,
              A,R,R,R,R,Y,R,R,R,G] ,
        
   hints :[0,0,2,2,0,0,3,2,1,2,
           3,1,0,0,2,0,2,0,0,2,
           3,0,1,3,0,0,2,0,2,0,
           1,2,0,0,1,0,2,0,0,1,
           3,3,2,0,0,2,0,0,2,3,
           2,0,0,0,1,0,2,1,0,1,
           0,0,3,2,0,0,0,0,2,0,
           0,0,3,1,3,2,0,1,3,2,
           0,1,1,2,0,1,0,2,0,0,
           2,0,1,0,0,2,2,0,0,2] ,

   nums : [0,0,3,3,0,3,0,2,2,2,
           0,3,0,0,2,0,2,0,0,2,
           0,0,1,0,0,0,2,0,2,0,
           3,3,0,0,3,0,2,0,0,4,
           0,0,2,0,0,1,0,0,3,0,
           3,0,0,0,4,0,5,5,0,4,
           0,0,0,3,0,0,0,0,3,0,
           0,0,0,2,0,2,0,1,0,2,
           0,4,1,3,0,3,0,2,0,0,
           3,0,4,0,0,1,3,0,0,1] 
} ;

function arrayToGrid(array,cols,rows){
let grid = [] ;
for(let i = 0; i< cols ; i++){
    grid[i] = [] ;
    for(let k = 0; k<rows; k++){
        grid[i][k] = undefined ;
    }
}
const len = array.length ;
for(let i = 0; i<array.length ; i++){
   const row = Math.floor( i / cols) ;
   const col = i - (row * cols ) ; 
   grid[col][row] = array[i] ;
}
return grid ;
}

function gridToArray(grid,cols,rows){
const arr = [] ;
for(let i = 0; i<cols; i++){
    for(let k=0 ; k<rows ; k++){
    arr.push(grid[k][i]) ;
    }
}
return arr ;
}

async function doSave(args){
    try{
    const handle = await window.showSaveFilePicker() ;
    const writer = await handle.createWritable() ;
    await writer.write(`${args}`) ;
    await writer.close() ;
    }
    catch(e){
        console.log(e) ;
    }
}

async function doRetrieve(scene){
    try{
    const [handle] = await window.showOpenFilePicker() ;
    const file = await handle.getFile() ;
    const str = await file.text() ;
    const arr = str.split(',') ;
    let hints =[] , nums =[], filled=[] ;
    let arrays = [hints,nums,filled]
 console.log(arr.length)
    for(let i = 0; i<arr.length ; i+=100){
    arrays[i/100] = arr.slice(i,i+100) ;
    const mehh = arrays[i/100] ;
    for(let k = 0; k<100; k++){
mehh[k] = Number.parseInt(mehh[k]) ;
    }
    }
    new Board(scene,10,10,32,32,0,0,arrays[2],arrays[0],arrays[1]) ;
    }

    catch(e){
        console.log(e) ;
    }
}

function makeHintArrays(grid , cols , rows){
let arr = gridToArray(grid, cols ,rows) ;
const filled = arr.map(item =>{
return colors.indexOf(item.fillColor) ;
}) ;

const nums = arr.map(item=>{
    const sq = grid[item.col][item.row] ;
    if(sq.isClueSquare && (sq.hint === NUM_ONLY || sq.hint === BOTH)){
    return sq.count;
    }
    return 0 ;
}) ;

const hints = arr.map(item=>{
    const sq = grid[item.col][item.row] ;
    if(sq.isClueSquare){
        return sq.hint ;
    }
    return EMPTY ;
}) ;
return {filled : filled , nums : nums , hints : hints } ;
}

//--------Start of palette-related subroutines -------- \\

const colorNames = ['yellow', 'green','red', 'blue', 'pink', 'purple','teal','gray'
 , 'maroon', 'blue-violet' , 'brown' , 'light green' , 'chocolate' , 'light blue' , 
'dark orange' , 'gold'] ;

const colorNumbers = ['#ffff00','#ff00','#ff0000','#ff','#ff00ff','#800080','#8080','#808080',
'#800000' ,'#8a2be2',  '#a52a2a' , '#7fff00', '#d2692e' , '#6495ed', '#ff8c00', '#ffd700'] ;

function populatePalette(div , widdy, lefty , scene){
div.addEventListener('click' , e=>{e.stopPropagation()});
const list = div.querySelector('#list') ;
list.addEventListener('click' , e=>{e.stopPropagation()});
const {top , height} = scene.mainDiv.querySelector('#top-content').getBoundingClientRect();
div.style.width = `${widdy * 4/5}px` ;
div.style.position = 'absolute' ;
div.style.top = top ;
div.style.left = `${lefty}px` ;
const h = 0.8 * height ;
div.style.height = 0.8 * height ;
list.style.height = 0.8 * h;
list.style.overflow = 'auto' ;
//div.style.overflow = 'auto';
colorNames.forEach((item,index)=>{
makeGroup(colorNumbers[index] , item , list , scene, scene.checkboxList) ;
});
const saveBtn = document.querySelector('#save-colour') ;
//saveBtn.textContent = `SAVE` ;
//saveBtn.setAttribute('id','save-btn') ;
scene.saveBtn = saveBtn ;
saveBtn.addEventListener('click' , (e)=>onSave(scene.checkboxList , scene , saveBtn))
saveBtn.setAttribute('disabled' , '') ;

}

function makeGroup( color , colorName , div , scene, list){
    const group = document.createElement('div') ;
    const check = document.createElement('input') ;
    const label = document.createElement('label') ;
    const span = document.createElement('span') ;
    check.setAttribute('id' , colorName) ;
    check.setAttribute('type' , 'checkbox') ;
    check.addEventListener('change' , ()=>checkOnChange(check , scene)) ;
    label.textContent = colorName.toUpperCase() ;
    label.setAttribute('for' , colorName) ;
    span.style.width = `20px` ;
    span.style.height = `20px` ;

    if(color.length !== 7){
        const missing = 7 - color.length;
        color = color.substring(1);
        for(let i = 0 ; i<missing; i++){
            color = `0${color}`;
        }
        color = `#${color}`;
    }

    span.style.backgroundColor = color ;
    span.style.display = `inline-block` ;

    const kids = [check , span , label] ;
    kids.forEach(item=>group.appendChild(item)) ;
div.appendChild(group) ;
list.push(group) ;
}

function checkOnChange(checkbox , scene){
    if(checkbox.checked && scene.clickedNum >= 4){
    checkbox.checked = false ;
    }
    
    else if(checkbox.checked === false){
    scene.clickedNum-- ; 
    scene.saveBtn.setAttribute('disabled' , '') ;
    }
    else{
    scene.clickedNum++ ;
    }
    if(scene.clickedNum === 4){
    scene.saveBtn.removeAttribute('disabled') ;
    }
}


function onSave(list , scene , saveBtn){
const inputs = list.map(item=>{
    const input = item.querySelector('input') ;
    return input ;
}) ;

const checked = inputs.filter(item=>item.checked === true) ; 
scene.currentColors = [] ;

checked.forEach(item=>{
const id = item.id ;
const index = colorNames.indexOf(id) ;
let colorString = colorNumbers[index] ;
colorString = colorString.substring(1) ;
colorString = `0x${colorString}` ;
scene.currentColors.push(Number.parseInt(colorString)) ;
}) ;

scene.board.changePalette(scene.currentColors) ;
saveBtn.setAttribute('disabled' , '') ;
scene.palette.style.visibility = 'hidden' ;
checked.forEach(item=>{item.checked = false ;}) ;
scene.clickedNum = 0 ; 
scene.menuState = NONE;
scene.currentMenus = undefined;
scene.makeColorGuides() ;
}

function resetPaletteUI(argsObj){
const {scene} = argsObj ;
scene.checkboxList.forEach(item=>{
item.querySelector('input').checked = false ;
});

scene.saveBtn.setAttribute('disabled' , '') ;
scene.clickedNum = 0 ;
}

function resetDimensionsUI(argsObj){
const {scene , saveSizeBtn , radioDivs} = argsObj ;
radioDivs.forEach(item=>{
    item.querySelector('input').checked = false ; 
});
saveSizeBtn.setAttribute('disabled' , '') ;
scene.newDimensions = undefined ; 

}


function changeDimension(scene){
const {newDimension , currentDimension , board} = scene ;


if(newDimension === currentDimension || newDimension === undefined){
scene.newDimension = undefined ;
scene.menuState = NONE;
return ; 
}

const dims = [scene , board] ;
dims.forEach(dim => {dim.cols = newDimension
dim.rows = newDimension});
scene.getTileSizes(scene.totalWidth) ;
/*
board.h = scene.h ;
board.w = scene.w ;
board.OX = scene.OX ; 
board.OY = scene.OY ;
const oldGrid = board.grid ;
board.mf(true , oldGrid);
*/

scene.getAndMakePuzzle() ;

scene.currentDimension = newDimension ;
scene.newDimension = undefined ;
scene.menuState = NONE;
resetDimensionsUI(scene.currentMenus.args);
scene.currentMenus = undefined;

}


export {EM,B,NMO,SQ,GREEN,RED,BLUE,YELLOW,R,A,Y,G,arrayToGrid,guides,Sticker,
    gridToArray,doSave,doRetrieve,colors,colorNums , makeHintArrays , populatePalette , makeGroup,
checkOnChange, colorNames, colorNumbers, onSave , resetPaletteUI, resetDimensionsUI,
changeDimension} ;