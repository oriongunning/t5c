import { TextBlock, AdvancedDynamicTexture, Button, Control, InputText, ScrollViewer, Rectangle, TextWrapping, StackPanel } from "@babylonjs/gui";
import { Scene, Engine, PointerEventTypes, Color3 } from "@babylonjs/core";

import { Room } from "colyseus.js";

import State from "../Screens/Screens";
import { Player } from "../../shared/Entities/Player";
import { Entity } from "../../shared/Entities/Entity";
import { countPlayers, roundToTwo } from "../../shared/Utils";
import { PlayerMessage } from "../../shared/types";
import Config from "../../shared/Config";

export class UserInterface {
    
    private _scene: Scene;
    private _engine: Engine;

    private _gameRoom: Room;
    private _chatRoom: Room;
    public _entities:Entity[];
    private _currentPlayer;

    //UI Elements
    private _playerUI;
    private _chatUI; 
    private _debugUI:Rectangle; 

    //Chat
    public messages: PlayerMessage[] = [];

    constructor(scene: Scene, engine:Engine, gameRoom:Room, chatRoom:Room, entities:Entity[], currentPlayer) {

        // set var we will be needing
        this._scene = scene;
        this._engine = engine;
        this._gameRoom = gameRoom;
        this._chatRoom = chatRoom;
        this._entities = entities;
        this._currentPlayer = currentPlayer;
 
        // create main io box
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this._scene);
        this._playerUI = playerUI;
        this._playerUI.idealHeight = 720;

        // create interface
        let debugTextUI = this.createDebugPanel();
        this.createChatPanel();
        this.createMisc();

        // some ui must be constantly refreshed as things change
        this._scene.registerBeforeRender(() => {

            // refresh 
            this._refreshDebugPanel(debugTextUI);

            // refresh 
            this.refreshPlayerUI();

             // refresh 
             this.refreshEntityUI();
            
        });

    }

    /**
     * Generate a hexadecimal color from a number between 0-100
     * @param value number between 0 - 100
     * @returns 
     */
    healthColor(value){
        let gHex = Math.round(value * 255 / 100) // rule of three to calibrate [0, 100] to [00, FF] (= [0, 255])
        let rHex = 255 - gHex // just the mirror of gHex
        let gHexString = gHex.toString(16) // converting to traditional hex representation
        let rHexString = rHex.toString(16)
        gHexString = gHexString.length === 1 ? `0${gHex}` : gHexString // compensating missing digit in case of single digit values
        rHexString = rHexString.length === 1 ? `0${rHex}` : rHexString
        return `#${rHexString}${gHexString}00` // composing both in a color code
      }

    public refreshPlayerUI(){
        for(let sessionId in this._entities){
            let player = this._entities[sessionId];
            // update player color outline
            let mesh = player.playerMesh.getChildMeshes()[0];
            if(mesh){
                mesh.outlineColor = Color3.FromHexString(this.healthColor(player.health));
            }
        }        
    }

    public refreshEntityUI(){
        for(let sessionId in this._entities){
            let player = this._entities[sessionId];
            // update player color outline
            let mesh = player.playerMesh.getChildMeshes()[0];
            if(mesh){
                mesh.outlineColor = Color3.FromHexString(this.healthColor(player.health));
            }
        }        
    }

    public showChatMessage(msg:PlayerMessage){
        let player = this._entities[msg.senderID];
        clearInterval(player.showTimer);
        if(player && player.characterLabel){
            let el = player.characterLabel;
            player.characterChatLabel.isVisible = true;
            player.characterChatLabel._children[0].text = msg.message;
            player.showTimer = setTimeout(function(){ player.characterChatLabel.isVisible = false; }, 20000);
        }
        
    }

    // set current player
    ////////////////////////////
    public setCurrentPlayer(currentPlayer){
        this._currentPlayer = currentPlayer;
        this.createCharacterPanel();
    }

    // create misc stuff
    ////////////////////////////
    public createMisc(){

        // add a quit button
        const quitButton = Button.CreateSimpleButton("quit", "Quit");;
        quitButton.width = "200px;";
        quitButton.height = "30px";
        quitButton.color = "white";
        quitButton.top = "20px"; 
        quitButton.left = "20px";
        quitButton.background = "#000"; 
        quitButton.thickness = 1;
        quitButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        quitButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._playerUI.addControl(quitButton);

        quitButton.onPointerDownObservable.add(() => { 
            this._gameRoom.leave();
            Config.goToScene(State.CHARACTER_SELECTION);
        });

    }

    // character panel
    ////////////////////////////
    public createDebugPanel(){
 
        // add stack panel
        const debugPanel = new Rectangle("debugPanel");
        debugPanel.top = "60px;"
        debugPanel.left = "20px;"
        debugPanel.width = "200px;"
        debugPanel.height = .2;
        debugPanel.background = "rgba(0,0,0,.5)";
        debugPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._playerUI.addControl(debugPanel);

        const debugText = new TextBlock("debugText");
        debugText.color = "#FFF";
        debugText.top = "5px"; 
        debugText.left = "5px";
        debugText.fontSize = "18px;";
        debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        debugPanel.addControl(debugText);
        
        return debugText;
    }

    // debug panel refresh
    private _refreshDebugPanel(debugTextUI){
        let locationText = "";
        locationText = "Zone: "+(global.T5C.currentLocation.title ?? 'undefined')+"\n";
        locationText += "RoomID: "+this._gameRoom.roomId+" \n";
        locationText += "PlayerID: "+this._gameRoom.sessionId+" \n";
        locationText += "Total Players: "+countPlayers(this._entities)+" \n";
        locationText += "FPS: "+roundToTwo(this._engine.getFps())+" \n";
        locationText += "Ping: 0.0ms \n";
        debugTextUI.text = locationText;
    }

    // character panel
    ////////////////////////////
    public createCharacterPanel(){

        if(!this._currentPlayer) return false

        // add stack panel
        const characterPanel = new Rectangle("debugPanel");
        characterPanel.top = "20px;"
        characterPanel.left = "-20px;"
        characterPanel.width = "200px;"
        characterPanel.height = "30px;";
        characterPanel.background = "rgba(0,0,0,.5)";
        characterPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        characterPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._playerUI.addControl(characterPanel);
        
        const characterPanelInside = new Rectangle("debugPanel");
        characterPanelInside.top = "0px;"
        characterPanelInside.left = "0px;"
        characterPanelInside.width = "200px;"
        characterPanelInside.thickness = 0;
        characterPanelInside.height = "30px;";
        characterPanelInside.background = "green";
        characterPanelInside.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        characterPanelInside.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        characterPanel.addControl(characterPanelInside);
        
        const characterText = new TextBlock("location", "");
        characterText.text = "Health: "+this._currentPlayer.health;
        characterText.color = "#FFF";
        characterText.top = "5px"; 
        characterText.left = "-5px";
        characterText.fontSize = "16px;";
        characterText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        characterText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        characterText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        characterText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        characterPanelInside.addControl(characterText);

         // some ui must be constantly refreshed as things change
         this._scene.registerBeforeRender(() => {
            characterText.text = this._currentPlayer.health;
            characterPanelInside.background = this.healthColor(this._currentPlayer.health);
            characterPanelInside.width = (this._currentPlayer.health * 2)+"px";
        });
    }

    // chat panel
    ////////////////////////////
    private createChatPanel(){

        let size = 0.5;

        // add chat input
        const chat_input = new InputText();
        chat_input.width = size;
        chat_input.height = '30px;'
        chat_input.left = '20px';
        chat_input.top = "-20px";
        chat_input.color = "#FFF";
        chat_input.placeholderText = "Write message here...";
        chat_input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        chat_input.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._playerUI.addControl(chat_input);

        chat_input.focus();
        // chatbox on enter event
        chat_input.onKeyboardEventProcessedObservable.add((ev) => { 
            if((ev.key==="Enter" || ev.code==="Enter") && chat_input.text != ""){
                
                this._chatRoom.send("message", {
                    name: this._currentPlayer.name,
                    message: chat_input.text
                });
                chat_input.text = "";
                chat_input.focus();
                this._refreshChatBox();
            }
        });

        // receive message event
        this._chatRoom.onMessage("messages", (message:PlayerMessage) => {
           this.messages.push(message); 
           this._refreshChatBox();
           this.showChatMessage(message);
        });

        // add default chat message
        this.messages.push({
            senderID: "SYSTEM",
            message: "Welcome to T5C, you can move around by left clicking and dragging the mouse around.",
            name: "SYSTEM",
            timestamp: 0,
            createdAt: ""
        }); 

        // add scrollable container
        var sv = new ScrollViewer("chat-scroll-viewer");
        sv.width = size;
        sv.height = "100px";
        sv.left = '20px';
        sv.top = "-50px";
        sv.background = "rgba(0,0,0,.5)";
        sv.alpha = 1;
        sv.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        sv.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        // add stack panel
        const sp = new StackPanel("chat-stack-panel");
        sp.width = "100%";
        sp.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        sp.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        sp.paddingTop = "5px;"
        sv.addControl(sp);

        this._chatUI = sp;
        this._playerUI.addControl(sv);

        // intial refresh chatbox
        this._refreshChatBox();
    }

    // chat refresh
    public addChatMessage(msg:PlayerMessage){
        this.messages.push(msg);
        this._refreshChatBox();
    }

    // chat refresh
    private _refreshChatBox(){

        // remove all chat and refresh
        let elements = this._chatUI.getDescendants();
        elements.forEach(element => {
            element.dispose();
        });

        this.messages.slice().reverse().forEach((msg:PlayerMessage) => {

            // container
            var headlineRect = new Rectangle("chatmessage_"+msg.createdAt);
            headlineRect.width = "100%";
            headlineRect.thickness = 0;
            headlineRect.paddingBottom = "5px";
            headlineRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            headlineRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            headlineRect.adaptHeightToChildren = true;
            this._chatUI.addControl(headlineRect);

            
            let prefix = '[GLOBAL] '+msg.name+': ';
            if(this._currentPlayer){
                prefix = msg.senderID == this._currentPlayer.sessionId ? 'You said: ' : '[GLOBAL] '+msg.name+': ';
            }
            
            // message
            var roomTxt = new TextBlock();
            roomTxt.paddingLeft = "5px";
            roomTxt.text = prefix+msg.message;
            roomTxt.textHorizontalAlignment = 0;
            roomTxt.fontSize = "12px";
            roomTxt.color = "#FFF";
            roomTxt.left = "0px";
            roomTxt.textWrapping = TextWrapping.WordWrap;
            roomTxt.resizeToFit = true;
            roomTxt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            roomTxt.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            headlineRect.addControl(roomTxt);

        });
        
    }

}