import { Scene, SceneLoader, Tags} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";

export class Environment {

    private _scene: Scene;

    constructor(scene: Scene) {

        this._scene = scene;

    }

    //What we do once the environment assets have been imported
    //handles setting the necessary flags for collision and trigger meshes,
     public async load() {
       
        const assets = await this._loadAsset();

        //Loop through all environment meshes that were imported
        assets.allMeshes.forEach(m => {

            // default values
            m.checkCollisions = true;
            m.isPickable = false;

            //dont check for collisions, dont allow for raycasting to detect it(cant land on it)
            if (m.name == "ground") { 
                m.receiveShadows = true;
                m.checkCollisions = false;
                m.isPickable = false;
            }

            //trigger meshes
            if (m.name.includes("trigger")) {

                m.isVisible = true;
                m.isPickable = false;
                m.checkCollisions = false;

                if(m.name.includes("teleporttoisland")){
                    m.metadata.location = "island";
                }

                if(m.name.includes("teleporttotown")){
                    m.metadata.location = "town";
                }

                m.name = "teleport";
            }
        });

     }


    //Load all necessary meshes for the environment
    public async _loadAsset() {

        //loads game environment
        const result = await SceneLoader.ImportMeshAsync(null, "./models/", global.T5C.currentLocation.mesh, this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        return {
            env: env,
            allMeshes: allMeshes
        }
    }

}