import Phaser from './phaser.js' ;
import { guides,GREEN,RED,BLUE,YELLOW,Sticker, gridToArray,doSave ,doRetrieve,
makeHintArrays , populatePalette , makeGroup, checkOnChange,colorNames, colorNumbers, onSave,
resetPaletteUI , resetDimensionsUI , changeDimension} from './utils.js';
import { addNotifUIs ,prepareConfirmBox, onNewGame , startAgainObj , newGameObj , doOK
,makeTween,NONE, OPTIONS_SHOWING,PALETTE_SHOWING,RADIOS_SHOWING,NOTIF_SHOWING,
doWinOrLose,prepareLostDiv, prepareWinDiv , doCancel , createWinLossUIs ,
clearThings, dealWithHash, makeLinkDiv} from './AC.js';
import {BS } from './alternative.js' ;
class Example extends Phaser.Scene {

    constructor(){
    super() ;

  this.onNewGame = onNewGame ;
this.doOK = doOK ;
this.clearThings = clearThings ;
    }

    preload(){
 
    }

    create(){

 this.totalWidth = this.scale.width ;
 this.totalHeight = this.scale.height ;
this.mainDiv = document.querySelector('#main');

const {width , height , left , right , top , bottom} = this.mainDiv.getBoundingClientRect() ;
 this.cols =10; this.rows = 10;
 
 this.palette = document.querySelector('#palette') ;
 this.clickedNum = 0 ;

 this.list = [] ;
this.currentColors = [YELLOW,GREEN,RED,BLUE] ;
this.checkboxList = [] ;
this.currentMenus ;
this.menuState = NONE ;
this.currentDimension = this.cols ;
populatePalette(this.palette , width , left, this) ; 
this.styleUIs() ;
this.setUpBtns() ;
 
document.body.addEventListener('mousedown' , e=>{
if(this.currentMenus === undefined)
return;

const {menuDiv , bool , func, args} = this.currentMenus ;
if(!this.isWithinNode(menuDiv , e.clientX , e.clientY)){
    this.currentMenus = undefined;
   if(this.menuState !== NOTIF_SHOWING)
   this.menuState = NONE; 
    menuDiv.style.visibility = 'hidden' ;
    this[bool] = false ;
    if(func){
     func(args) ;
    }
}

   });


 const hashStr = window.location.hash.substring(1) ;
 const hasHash = hashStr.length !== 0 ;

this.setLink() ;

 if(hasHash){
  this.getPuzzleFromHash(hashStr) ;
 }
 else{
    this.getAndMakePuzzle() ;
 }

}   

setUpBtns(){
this.startAgains = document.querySelectorAll('.start-again') ;

this.startAgains.forEach( item =>{
if(item.parentElement === this.controlBtns){
item.addEventListener('click' , e=>{
if(this.menuState === NOTIF_SHOWING)
return ;     
prepareConfirmBox(this , startAgainObj);});
}

else{
item.addEventListener('click' , e=> this.onStartAgain());
}
});


this.OK = document.querySelector('.ok') ;
this.OK.addEventListener('click' ,  e=>{
this.doOK() ;
});

const anim = document.querySelector('#check-board');
anim.addEventListener('click' , e=>{
 //   e.stopPropagation();
if(this.menuState === NOTIF_SHOWING)
return;
/*
if(this.currentMenus ){
    const {menuDiv, func ,args} = this.currentMenus;
    if(this.isWithinNode(menuDiv , e.clientX, e.clientY)){
        return;
    }
    menuDiv.style.visibility = 'hidden';
    this.currentMenus = undefined;
    this.menuState = NONE;
    if(func){
        func(args);
    }
    }
    */
const list = this.board.gridToArray(this.board.grid);
makeTween(this,list);
});

this.cancelables = document.querySelectorAll('.cancelable');
this.cancelables.forEach(item=>{
item.addEventListener('click' , e=>{
    /** @type HTMLElement */
const elem = e.target;
if(elem.className === 'cancel'){
this.clearThings(this);
}
});
});


this.newGameBtns = document.querySelectorAll('.new-game');
const newGameBtns = this.newGameBtns ;
newGameBtns.forEach(item =>{

if(item.parentElement === this.controlBtns){
item.addEventListener('click' , e=>{

if(this.menuState === NOTIF_SHOWING )
return ;
prepareConfirmBox(this , newGameObj);
});   
}

else{
    item.addEventListener('click' , e=> this.onNewGame());   
}
}) ;
    

const returnToPuzzles = document.querySelectorAll('.return-to-puzzle');
returnToPuzzles.forEach(item =>{
    item.addEventListener('click' , e=>{
        this.clearThings(this);
    });
});

/*
const removeText ='Remove Dots';
const restoreText = 'Use Dots';
this.dotsOn = true;


const removeDots = document.querySelector('#remove-dots');
removeDots.addEventListener('click' , e=>{
    e.stopPropagation();
    if(removeDots.textContent === removeText){
        this.board.removeDots(removeDots , removeText , restoreText);
    }

    else{
        this.board.restoreDots(removeDots, removeText , restoreText );
    }
});
*/

const aboutBtn = document.querySelector('#about');

aboutBtn.addEventListener('click' , e =>{
    e.stopPropagation();

});
}

onStartAgain(){
for(let i = 0 ; i<this.cols ; i++){
    for(let k = 0 ; k<this.rows ; k++){
    const grid = this.board.grid ; 
    const sq = grid[i][k] ;
    sq.fillColor = sq.color ; 
  sq.setClue(sq.hint) ;
  sq.currentIndex = sq.allColors.indexOf(sq.fillColor) ;
    }
}
this.menuState = NONE;
this.clearThings(this);
}

styleUIs(){
const mainDiv = this.mainDiv;
const {left , right , top ,bottom , width , height} = mainDiv.getBoundingClientRect();

addNotifUIs(this);
createWinLossUIs(this);
makeLinkDiv(this);

const scene = this ;
const aboutSettings = document.querySelector('#top-strip') ;

const about = aboutSettings.querySelector('#help') ;
const settings = aboutSettings.querySelector('#settings') ;
const widgets = [about , settings] ;

this.settings = settings ;

/** @type HTMLDivElement */
const options = document.querySelector('#menu-options') ;
options.style.visibility = 'hidden' ;
const optionsWidth = options.getBoundingClientRect().width ;
options.style.left = `${right - optionsWidth}px`;
options.style.top = `${top}px` 

settings.addEventListener('click' , e=>{
e.stopPropagation();

if(this.currentMenus ){
const {menuDiv, func ,args} = this.currentMenus;
if(this.isWithinNode(menuDiv , e.clientX, e.clientY)){
    return;
}
menuDiv.style.visibility = 'hidden';
this.currentMenus = undefined;
this.menuState = NONE;
if(func){
    func(args);
}
}

if(this.menuState !== OPTIONS_SHOWING && this.menuState !== NOTIF_SHOWING){
this.menuState = OPTIONS_SHOWING;
options.style.visibility = 'visible' ;
this.menusAreShowing = true ;
this.currentMenus = {menuDiv : options} ;
}
}) ;


const changeSizeDiv = document.querySelector('#change-size-div') ;
changeSizeDiv.addEventListener('click',e=>{e.stopPropagation()});
changeSizeDiv.style.left = left ;
changeSizeDiv.style.top = top ;
changeSizeDiv.style.width = 4/5 * width;
const listDivs = changeSizeDiv.querySelector('#size-list').querySelectorAll('div') ;

const saveSizeBtn = document.querySelector('#save-size') ;
saveSizeBtn.setAttribute('disabled' , '') ;
const changeSizeBtn = document.querySelector('#change-size') ;
changeSizeBtn.addEventListener('click' , e=>{
this.menuState = RADIOS_SHOWING ;
changeSizeDiv.style.visibility = 'visible' ;
options.style.visibility = 'hidden' ;
this.currentMenus = {menuDiv : changeSizeDiv , bool : 'radiosAreShowing', 
func: resetDimensionsUI , args:{scene:scene, radioDivs:listDivs , saveSizeBtn :saveSizeBtn }};
});

const changePaletteBtn = document.querySelector('#change-palette') ;

changePaletteBtn.addEventListener('click' , e=>{
this.menuState = PALETTE_SHOWING ;
options.style.visibility = 'hidden' ;
this.palette.style.visibility = 'visible' ;
this.paletteIsShowing = true ;
this.currentMenus = {menuDiv : this.palette , bool : 'paletteIsShowing'
, func : resetPaletteUI , args : {scene : scene }};
}) ;

const sizeDiv = document.querySelector('#size-list') ;
sizeDiv.addEventListener('click' , e=>{
if(e.target instanceof HTMLInputElement){
//const radio = e.currentTarget ;
saveSizeBtn.removeAttribute('disabled') ;
}
 });

saveSizeBtn.addEventListener('click' , e=>{
this.menuState = NONE;
const list = [] ;
listDivs.forEach(item => list.push(item)) ;
let chosen = list.map(item=>item.querySelector('input'));
chosen = chosen.filter(item=>item.checked === true) ;
const d = Number.parseInt(chosen[0].id);
this.newDimension = d ;
changeDimension(this) ;
changeSizeDiv.style.visibility = 'hidden' ;
});


this.getTileSizes( this.totalWidth);
this.controlBtns = document.querySelector('#control-buttons') ;

this.menuOptions = options ;

options.addEventListener('click' , e=>{
    e.stopPropagation() ;
}) ;

const ins = document.querySelector('#instructions');
ins.style.top = height / 4;
ins.style.width = 95/100 * width;
ins.style.left = left + (5/100 * width) / 2;
ins.style.height = height * 3/4;
about.addEventListener('click', e=>{
    e.stopPropagation();

    if(this.currentMenus){
    const {menuDiv , func , args} = this.currentMenus;
    if(this.isWithinNode(menuDiv , e.clientX, e.clientY)){
        return;
    }
    menuDiv.style.visibility = 'hidden';
    this.currentMenus = undefined;
    this.menuState = NONE;
    if(func){
        func(args);
    }
    }

    if(this.menuState!== NOTIF_SHOWING){
ins.style.visibility = 'visible';
this.menuState = NOTIF_SHOWING;
this.notifBox = ins ;
    }
});


const makeLinkBtn = document.querySelector('#make-puzzle-link');
makeLinkBtn.addEventListener('click', e=>{
this.clearThings(this);
this.linkDiv.style.visibility = 'visible';
this.menuState = NOTIF_SHOWING;
this.notifBox = this.linkDiv;
});
}


isWithinNode(node , eX , eY){
const {left , right , top , bottom} = node.getBoundingClientRect() ;
if(eX > left && eX < right && eY > top && eY < bottom)
return true ;
return false ;
}


getTileSizes(availWidth){
const maxWidth = (availWidth - 4) / this.cols ;
this.w = maxWidth ;
this.h = maxWidth ; 

this.OX = 2 ; 
this.OY = 2;
return maxWidth ;
}

handleDots(){
    const removeText ='Remove Dots';
    const restoreText = 'Use Dots';
    const removeDots = document.querySelector('#remove-dots');  
if(this.dotsOn){
    this.board.restoreDots(removeDots , removeText , restoreText);
}

else{
    this.board.removeDots(removeDots , removeText , restoreText); 
}
}


async getAndMakePuzzle(){
  
 this.removeOldBoard();

const res = await fetch(`${this.link}/game/${this.cols}` /*,{ method:'post' , 
headers:{"Content-Type" : 'application/json'} , body:JSON.stringify({d:this.cols})}*/) ;
const data = await res.json();
const {list , id} = data ;
this.gameID = id ;
this.board = new BS(this,this.cols,this.rows,this.w,this.h,this.OX,this.OY, list) ;
/** @type {Element} */
const p = this.linkDiv.querySelector('#link') ;
console.log(location) ;
//p.textContent = `postzed.github.io/Ran-gi/#${id}` ;
p.textContent = `${this.hashLink}/#${id}` ;
this.makeColorGuides();
}


async getPuzzleFromHash( id ){
    //`http://localhost:8000/game/${id}`
const res = await fetch(`${this.link}/game/${id}`) ;
const {list , d} = await res.json() ;
this.cols = this.rows = d ;
this.getTileSizes(this.totalWidth) ;
this.board = new BS(this,this.cols,this.rows,this.w,this.h,this.OX,this.OY, list) ;
const p = this.linkDiv.querySelector('#link') ;
//p.textContent = `postzed.github.io/Ran-gi/#${id}` ;
p.textContent = `${this.hashLink}/#${id}` ;
this.makeColorGuides() ;
}


removeOldBoard(){
    if(this.board){
        const len = this.board.grid.length ;
        for(let i = 0 ; i<len ; i++){
            for(let k=0; k<len ; k++){
            const tile = this.board.grid[i][k];
            const props = [tile.dot , tile.num , tile] ;
             props.forEach(item=>item.destroy());
            }
        }
    }
}

makeColorGuides(){
    if(!this.colorGuides){
 let colorGuides = document.querySelectorAll('.color-guide');
 let parent = document.querySelector('#color-guide-container') ;
 const {width , height} = parent.getBoundingClientRect() ;
 colorGuides = Array.from(colorGuides);
 colorGuides.forEach((item , i)=>{
    const dim = height * 0.7 ;
    item.style.height = `${dim}px` ;
    item.style.width = `${dim}px` ;
    let hex = Number(this.currentColors[i]).toString(16) ;
    item.style.backgroundColor = `#${hex.padStart(6 , "0")}` ;
 }
 );
 this.colorGuides = colorGuides ;
}

else{
    this.colorGuides.forEach((item , i)=>{
        let hex = Number(this.currentColors[i]).toString(16) ;
        item.style.backgroundColor = `#${hex.padStart(6 , "0")}` ;
     }
     );
}
}

setLink(){
    const domain = document.domain ;
    console.log(domain);
   if(domain === `127.0.0.1`){
    this.link = /*`http://localhost:8000`;*/`https://waiting-helix-pangolin.glitch.me`;
    this.hashLink = `${location.origin}`
   }

   else{
    this.link = `https://waiting-helix-pangolin.glitch.me`;
    this.hashLink = `${location.origin}/Ran-gi` ;
   }
}


    update(){

    }
    
}

/*
const w = window.innerWidth > 600 ? window.innerWidth / 3.5: window.innerWidth ;
console.log(window.innerHeight , w, window.innerHeight / w, "The ratio of height to width");
*/
const div = document.querySelector('#main');
let w = window.innerWidth;

if(window.innerWidth / window.innerHeight > 0.7){
w = window.innerHeight * 0.7 ;
div.style.width = w ;
div.style.height = window.innerHeight ;
}

else{
    div.style.width = w ;
    div.style.height = window.innerHeight ;
}

const config = {
    type: Phaser.CANVAS,
   width: w,
   height:w ,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
   parent: 'game',
    dom: {
createContainer:true
    },
    scene: Example ,
   backgroundColor : 0xffffff 
    
  //  scale:{autoCenter:Phaser.Scale.Center.CENTER_HORIZONTALLY}
};

new Phaser.Game(config);