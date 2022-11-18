import { Scene } from '@babylonjs/core';

// colyseus
import { Client, Room } from "colyseus.js";
import { resolve } from 'path';

import Config from '../../shared/Config';

export class GameNetwork {

    public _client;
    public _scene;

    constructor(scene: Scene) {

        this._scene = scene;

        // create colyseus client
        // this should use environement values
        if ( window.location.host === "localhost:8080") {
            this._client = new Client(Config.serverUrlLocal); // local
        }else{
            this._client = new Client(Config.serverUrlProduction); // online
        }   
    }

    public async joinRoom(roomId):Promise<any> {
        return await this._client.join("game_room", { 
            roomId: roomId
        });
    }

    public async createRoom(currentRoomKey):Promise<any> {
        return await this._client.create("game_room", { 
            location: currentRoomKey
        });
    }

    public async findCurrentRoom(currentRoomKey):Promise<any> {
        let rooms = await this._client.getAvailableRooms("game_room");
        if(rooms.length > 0){
            let exists = false;
            rooms.forEach((room) => {
                if(room.location === currentRoomKey){
                    return room;
                }
            });
            if(!exists){
                return false
            }
        }
        return false;

    }
}