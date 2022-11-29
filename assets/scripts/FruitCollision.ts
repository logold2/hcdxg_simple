// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitCollision extends cc.Component {

    fruitNumber: number = 0;//代表自身是那种类型的水果

    returnNumber: boolean = false;
    getNumberTime: number = 0;

    bianjieX: number = 0;// 防止水果位置超出屏幕外

    testEndDJS: number = 0;// 检测死亡倒计时
    endOne: number = 0; //只执行一次结束

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.bianjieX = 360 - this.node.width / 2;
    }

    update(dt) {
        if (this.node.x < -this.bianjieX) {
            this.node.x = -this.bianjieX
        }
        if (this.node.x > this.bianjieX) {
            this.node.x = this.bianjieX
        }


        if (this.returnNumber) {
            this.scheduleOnce(() => {
                this.getNumberTime = 0
            }, 0.25)
            this.returnNumber = false;
        }

        if (this.node.parent.name == "FruitNode") {
            this.testEndDJS += dt;
            //cc.log(this.testEndDJS)
        }

        if (this.node.y + this.node.width / 2 > cc.find("Canvas/LineNode").children[0].y && this.endOne == 0 && this.testEndDJS > 3) {

            for (let i = 0; i < cc.find("Canvas/FruitNode").children.length; i++) {
                cc.find("Canvas/FruitNode").children[i].removeComponent(cc.PhysicsCircleCollider);
                cc.find("Canvas/FruitNode").children[i].removeComponent(cc.RigidBody);

            }
            this.node.color = cc.Color.RED;
            cc.tween(this.node)
                .to(0.3, { opacity: 0 })
                .to(0.3, { opacity: 255 })
                .union()
                .repeat(3)
                .call(() => {
                    GameManager.Instance.end();
                    cc.find("Canvas/LineNode").children[0].active = false;
                })
                .start()

            this.endOne++;
        }
    }

    //  防止多次碰撞
    getNumber() {

        let ad = this.getNumberTime;
        this.getNumberTime++;
        this.returnNumber = true;

        return ad;
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.group == "fruit") {
            //this.endCtrl = true;
            //  只有下方的水果触发碰撞回调
            if (selfCollider.node.y < otherCollider.node.y) {
                return
            }
            //  水果一下落，放在FruitNode节点下
            selfCollider.node.parent = cc.find("Canvas/FruitNode");
            if (selfCollider.node.getComponent(cc.RigidBody) != null) {
                selfCollider.node.getComponent(cc.RigidBody).angularVelocity = 0;
                // 限制一下线速度
            }

            let selfNum = this.fruitNumber;
            let otherNum = otherCollider.node.getComponent("FruitCollision").fruitNumber;
            //  水果类型相同的合成
            if (selfNum == otherNum && selfNum < 9 && otherNum < 9) {
                if (selfCollider.node.getComponent("FruitCollision").getNumber() == 0) {
                    otherCollider.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
                    otherCollider.node.getComponent(cc.PhysicsCircleCollider).apply()
                    this.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
                    this.node.getComponent(cc.PhysicsCircleCollider).apply();
                    cc.tween(selfCollider.node)
                        .to(0.1, { position: otherCollider.node.position })
                        .call(() => {
                            //生成下一个等级的水果
                            GameManager.Instance.score += this.fruitNumber + 1;
                            GameManager.Instance.createLevelUpFruit(this.fruitNumber + 1, otherCollider.node.position);
                            otherCollider.node.active = false;
                            selfCollider.node.active = false;
                            otherCollider.node.destroy();
                            selfCollider.node.destroy();
                        })
                        .start()
                }
            } else if (selfNum == otherNum && selfNum == 9 && otherNum == 9) {
                if (selfCollider.node.getComponent("FruitCollision").getNumber() == 0) {
                    otherCollider.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
                    otherCollider.node.getComponent(cc.PhysicsCircleCollider).apply()
                    this.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
                    this.node.getComponent(cc.PhysicsCircleCollider).apply();
                    cc.tween(selfCollider.node)
                        .to(0.1, { position: otherCollider.node.position })
                        .call(() => {
                            GameManager.Instance.score += this.fruitNumber + 1;
                            GameManager.Instance.createLevelUpFruit(this.fruitNumber + 1, otherCollider.node.position);
                            otherCollider.node.active = false;
                            selfCollider.node.active = false;
                            otherCollider.node.destroy();
                            selfCollider.node.destroy();
                        })
                        .start()

                }
            }
        }
    }
}
