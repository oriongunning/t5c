import { Scene, ActionManager, ExecuteCodeAction, Observer, Scalar, PointerEventTypes } from '@babylonjs/core';
import { Hud } from './ui';

export class PlayerInput {

    public inputMap: {};
    private _scene: Scene;

    //simple movement
    public horizontal: number = 0;
    public vertical: number = 0;

    //tracks whether or not there is movement in that axis
    public horizontalAxis: number = 0;
    public verticalAxis: number = 0;

    //jumping and dashing
    public jumpKeyDown: boolean = false;
    public dashing: boolean = false;

    // moving
    public moving: boolean;

    constructor(scene: Scene) {

        this._scene = scene;

        // detect mouse movement
        this._scene.onPointerObservable.add((pointerInfo) => {

            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.event.button == 0) {
                    this.moving = true
                }
            }

            if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                if (pointerInfo.event.button == 0) {
                    this.moving = false;
                    this.inputMap = { rotY: null }
                    this.vertical = 0;
                    this.horizontal = 0;
                }
            }

            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                if (this.moving) {
                    const x = (pointerInfo.event.x / pointerInfo.event.target.width) * 2 - 1;
                    const y = (pointerInfo.event.y / pointerInfo.event.target.height) * 2 - 1;
                    this.inputMap = { rotY: Math.atan2(x, y) }
                    this._updateFromMouse();
                }
            }
        });


    }

    //handles what is done when mouse is pressed or moved
    private _updateFromMouse(): void {

        //lerp will create a scalar linearly interpolated amt between start and end scalar
        //taking current horizontal and how long you hold, will go up to -1(all the way left)

        //forward - backwards movement
        if (this.inputMap["rotY"]) {
            this.vertical = -Math.cos(this.inputMap["rotY"]);
            this.verticalAxis = 1;
            // this.horizontal = Scalar.Lerp(this.horizontal, -d, 0.2);
            this.horizontal = Math.sin(this.inputMap["rotY"]);
            this.horizontalAxis = -1;
        }
    }
}