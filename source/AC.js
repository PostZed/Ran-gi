import Phaser from "./phaser.js";
const NONE = 1 , OPTIONS_SHOWING = 2 , PALETTE_SHOWING = 3,
RADIOS_SHOWING = 4 , NOTIF_SHOWING = 5 ;
import {SQ,B} from './utils.js' ;

function addNotifUIs( scene ){
const confirmBox = document.querySelector('#confirmation-div');
const {width , height , left , right , top , bottom} = 
scene.mainDiv.querySelector('#top-content').getBoundingClientRect() ;
const offset = width * 5 / 100 ;
confirmBox.style.top = top + 1/4 * height;
confirmBox.style.left = left + offset / 2;
confirmBox.style.width = `${offset * 18}px` ;
scene.confirmBox = confirmBox ;
scene.notifPara = confirmBox.querySelector('p') ;
}

function prepareConfirmBox(scene , notifObj){
const msg = notifObj.msg ; 
scene.notifPara.textContent = msg ;
scene.confirmBox.style.visibility = 'visible' ;
scene.currentConfirmation = notifObj ;
scene.menuState = NOTIF_SHOWING;
scene.notifBox = scene.confirmBox;
}

function onNewGame(){
const board = this.board ;
const oldGrid = board.grid ;
/*
board.grid = board.createGrid(board.cols , board.rows) ;
board.fillGrid(true, oldGrid); 
board.mf(true , oldGrid);  
*/
this.getAndMakePuzzle() ;
this.clearThings(this);

}


function makeTween(scene , list){

if(scene.board.boardIsFilled() === false)
return;

const promises = [];
list.forEach(item =>{
   const nuX = item.x + item.w/2;
   const nuY = item.y + item.w/2;
   const elems = [item , item.num];
   item.dot.setVisible(false);
   elems.forEach(elem=>{
    elem.setOrigin(0.5);
    elem.x = nuX;
    elem.y = nuY;
  });
    
    /** @type {Phaser.Tweens.Tween} */
    
   const tween = scene.tweens.add({targets:[item, item.num],
      //  scale: 0,
      angle: 360,
        duration:1000,
        delay:0,
        repeat:0,
        ease:'Power3',
        yoyo:true
        });
        

  const promise = new Promise((resolve) =>{
tween.setCallback('onComplete' , ()=>{
   resolve(item);
});
  }); 
  promises.push(promise); 
});
scene.menuState = NOTIF_SHOWING;
Promise.all(promises).then((list)=>{
for(const sq of list){
  sq.setOrigin(0);

const num = sq.num;
num.setOrigin(0);
const nuX = sq.x - sq.w/2;
const nuY = sq.y - sq.h/2;
num.x = nuX;
num.y = nuY;
sq.x = nuX;
sq.y =nuY;
if(sq.hint === B || sq.hint === SQ){
sq.dot.setVisible(true);
}
}
 
  doWinOrLose(scene);
});
}



function doOK(){
const {func} = this.currentConfirmation ; 
this[func]() ;

this.clearThings(this);
}


function doWinOrLose(scene){
const board = scene.board;
if(board.isCorrect()){
prepareWinDiv(scene);
}

else{
prepareLostDiv(scene);
}
}


function prepareWinDiv(scene){
scene.winDiv.style.visibility = 'visible';
scene.menuState = NOTIF_SHOWING;
scene.notifBox = scene.winDiv;
}


function prepareLostDiv(scene){
    scene.lostDiv.style.visibility = 'visible';
    scene.menuState = NOTIF_SHOWING;
    scene.notifBox = scene.lostDiv;  
}

function doCancel(scene , parentDiv){
parentDiv.style.visibility = 'hidden';
scene.menuState = NONE ;
scene.notifBox = undefined;
scene.currentConfirmation = undefined;
}


function createWinLossUIs(scene){
  const {width , height , left , right , top , bottom} = scene.mainDiv.getBoundingClientRect() ;
  const topStrip = scene.mainDiv.querySelector('#top-strip');
//const underOfTop = topStrip.getBoundingClientRect().bottom;
scene.winDiv = document.querySelector('#has-won-game');
scene.lostDiv = document.querySelector('#has-lost-game');
const divs = [scene.winDiv , scene.lostDiv];

divs.forEach(item=>{
    const offset = width * 10 / 100 ; 
    item.style.top = top + 1/4 * height;
    item.style.left = left + offset / 2;
    item.style.width = `${offset * 9}px` ;
});
}

function clearThings(scene){
if(scene.notifBox)
scene.notifBox.style.visibility = 'hidden';

scene.notifBox = undefined;
scene.currentConfirmation = undefined;
scene.notifObj = undefined;
scene.menuState = NONE;

if(scene.currentMenus){
const {menuDiv} = scene.currentMenus;
menuDiv.style.visibility = 'hidden';
scene.currentMenus = undefined;
}

}

function dealWithHash(scene){
  const hashStr = window.location.hash.toString();
  if(hashStr.length === 0)
  return undefined;

  const arr = JSON.parse(hashStr.substring(1));
  const d = arr[0];
  scene.cols = scene.rows = d;
  scene.h = scene.w = (scene.totalWidth - 4) / d ;
  arr.splice(0,1);
return arr;
}

function makeLinkDiv(scene){
  const {width , height , left , right , top , bottom} = scene.mainDiv.getBoundingClientRect() ;
  const item = scene.linkDiv = document.querySelector('#link-div');
  const offset = width * 10 / 100 ; 
    item.style.top = top + 1/4 * height;
    item.style.left = left + offset / 2;
    item.style.width = `${offset * 9}px` ;
    item.style.height = height * 1/4;
  
}

const startAgainObj = {
msg : `Are you sure you want to start again? All your answers will be removed. Continue?` , 
func : 'onStartAgain'
}

const newGameObj ={
msg : ` Are you sure you want to start a new game? A new board will be generated. Continue?`,
func : 'onNewGame' 
}
 

export {addNotifUIs , prepareConfirmBox, onNewGame , startAgainObj , newGameObj , doOK , makeTween, 
NONE, OPTIONS_SHOWING,PALETTE_SHOWING,RADIOS_SHOWING,NOTIF_SHOWING, doWinOrLose,prepareLostDiv,
prepareWinDiv , doCancel , createWinLossUIs , clearThings,dealWithHash, makeLinkDiv} ;