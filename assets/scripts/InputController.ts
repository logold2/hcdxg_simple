import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InputController extends cc.Component {

    touchNum: number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    start() {
        this.openTouch();
    }

    // update (dt) {}
    openTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    onTouchStart(e) {
        if (GameManager.Instance.targetFruit != null) {//检测targetFruit是否为空 空就不执行任何动作
            this.touchNum = 1;
            let posx = this.node.convertToNodeSpaceAR(e.getLocation()).x;//获取点击位置的x值
            let posy = GameManager.Instance.targetFruit.y;//获取上方水果的y值
            cc.tween(GameManager.Instance.targetFruit)
                .to(0.1, { position: cc.v3(posx, posy, 0) })
                .start()
        }

    }

    onTouchMove(e) {
        if (GameManager.Instance.targetFruit != null) {
            this.touchNum = 1;
            GameManager.Instance.targetFruit.x = this.node.convertToNodeSpaceAR(e.getLocation()).x; //水果跟随鼠标移动
        }
    }

    onTouchEnd(e) {
        if (GameManager.Instance.targetFruit != null && this.touchNum == 1) { //this.touchNUm 是防止下落位置错误
            this.touchNum = 0;
            //  给targetFruit重新设置物理参数
            //  碰撞器的半径为fruit高度的一半
            GameManager.Instance.targetFruit.getComponent(cc.PhysicsCircleCollider).radius = GameManager.Instance.targetFruit.height / 2;
            //  保存
            GameManager.Instance.targetFruit.getComponent(cc.PhysicsCircleCollider).apply();
            //  刚体类型改为动态
            GameManager.Instance.targetFruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
            //  给一个初始的下落线速度
            GameManager.Instance.targetFruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -800)
            //  属性改完后，targetFruit设置为空，防止连续操作
            GameManager.Instance.targetFruit = null;
            this.scheduleOnce(() => {
                GameManager.Instance.createOneFruit(Math.floor(Math.random() * 5), cc.v2(0, 500));
            }, 0.5)
        }
    }
}
