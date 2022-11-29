// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        endPos:cc.Node,
        parent:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

   onLoad () {
       cc.director.getPhysicsManager().enabled = true;//物理游戏，开启物理
     //  return
        var self=this;
       cc.log("self.endPos.position",self.endPos.position);
        cc.tween(this.node)
            .delay(1)
            .call(()=>{
                let node=[];
                for(let i=0;i<this.parent.childrenCount;i++){
                    let tt=this.parent.children[i];
                    let min=0;
                    let max=20;
                    let dd=min+ Math.floor(Math.random() * (max - min + 1));
                    let com=tt.getComponent(cc.PhysicsCircleCollider)
                    com.radius=dd;
                    com.apply();
                    node.push(tt)
                }
                for(let j=0;j<node.length;j++){
                    let co=node[j];
                    cc.tween(co)
                        .to((j*0.1),{position:self.endPos.position})
                        .call(()=>{
                          // let ccd= co.getComponent(cc.PhysicsCircleCollider)
                            //let ccd2= co.getComponent(cc.RigidBody)
                            // ccd2.gravity=1;
                           // ccd.restitution=1;
                            //ccd2.apply();
                           // ccd.apply();
                        })
                        .start();
                }
            })
            .start()

   },

    start () {

    },

    // update (dt) {},
});
