

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    public static Instance: GameManager = null;

    @property(cc.Node)
    fruitNode: cc.Node = null;
    @property(cc.Node)
    targetfruitNode: cc.Node = null;
    @property(cc.Prefab)
    fruitPre: cc.Prefab = null;
    @property(cc.Node)
    lineNode: cc.Node = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    targetFruit: cc.Node = null;

    @property(cc.SpriteFrame)
    Allfruit: cc.SpriteFrame[] = [];

    score: number = 0;
    endOne: number = 0;//限制次数
    fruitHeigth: number = 0;//下面水果中最高的高度

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (GameManager.Instance != null) {
            GameManager.Instance.destroy();
        }
        GameManager.Instance = this;
        cc.director.getPhysicsManager().enabled = true;//物理游戏，开启物理
    }

    start() {
        cc.tween(this.lineNode.children[0])
            .to(0.3, { opacity: 255 })
            .to(0.3, { opacity: 0 })
            .union()
            .repeatForever()
            .start()
        this.lineNode.children[0].active = false;
        this.createOneFruit(9, cc.v2(0, 500))
    }

    update(dt) {
        this.scoreLabel.string = this.score.toString();
        //  红线是否开启预警
        if (this.lineNode.children[0].y - GameManager.Instance.fruitHeigth < 200 && this.lineNode.children[0].y - GameManager.Instance.fruitHeigth >= 0) {
            this.lineNode.children[0].active = true;
        }
        if (this.lineNode.children[0].y - GameManager.Instance.fruitHeigth > 200) {
            this.lineNode.children[0].active = false;
        }
    }

    /**
     * 生成一个水果
     * @param _fruitNum 水果类型 0是葡萄 以此类推
     * @param _pos 水果生成的位置
     */
    createOneFruit(_fruitNum: number, _pos: cc.Vec2) {
        let fruit = cc.instantiate(this.fruitPre);//实例化一个预制体
        fruit.setParent(this.targetfruitNode)//更改fruit父节点
        fruit.getComponent(cc.Sprite).spriteFrame = this.Allfruit[_fruitNum];//更改fruit的图片
        fruit.getComponent("FruitCollision").fruitNumber = _fruitNum;//fruit碰撞回调脚本，里面有一个当前水果类型 如果是葡萄 fruitNumber为0 用于相同合成检测
        fruit.setPosition(_pos);//设置坐标
        fruit.setScale(0)//出生时scale设置为0
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;//刚体类型设置为Static防止下落
        fruit.getComponent(cc.PhysicsCircleCollider).radius = 0;//碰撞器半径先设置位0，下落时再改到相应水果大小
        fruit.getComponent(cc.PhysicsCircleCollider).apply();//保存碰撞器更改的参数

        //水果生成时执行一个缩放动作
        cc.tween(fruit)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .call(() => {
                this.targetFruit = fruit;//将我们控制的水果targetFruit设置为刚生成的fruit
            })
            .start()
    }

    /**
     * 生成高一级的水果
     * @param _fruitNum 水果
     * @param _pos 位置
     */
    createLevelUpFruit(_fruitNum, _pos) {
        //AudioManager.Instance.Play(6, false, 1)
        let fruit = cc.instantiate(this.fruitPre);
        fruit.parent = this.fruitNode;

        fruit.getComponent(cc.Sprite).spriteFrame = this.Allfruit[_fruitNum];
        fruit.getComponent("FruitCollision").fruitNumber = _fruitNum;
        fruit.position = _pos;
        fruit.scale = 0;
        fruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -100);
        fruit.getComponent(cc.PhysicsCircleCollider).radius = fruit.height / 2;
        fruit.getComponent(cc.PhysicsCircleCollider).apply();
        cc.tween(fruit)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .call(() => {
                if (fruit.getComponent(cc.PhysicsCircleCollider) != null) {
                    fruit.getComponent(cc.PhysicsCircleCollider).radius = fruit.height / 2;
                    fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
                    fruit.getComponent(cc.PhysicsCircleCollider).apply();
                }

            })
            .start()

        GameManager.Instance.fruitHeigth = GameManager.Instance.findHighestFruit();

    }

    //  结束
    end() {
        if (this.endOne == 0) {
            let i = 0;
            for (let j = this.fruitNode.children.length - 1; j >= 0; j--) {
                i++;
                setTimeout(() => {
                    GameManager.Instance.score += this.fruitNode.children[j].getComponent("FruitCollision").fruitNumber + 1;
                    this.fruitNode.children[j].active = false;
                }, i * 100);
            }

            this.targetfruitNode.active = true;
            for (let i = 0; i < this.targetfruitNode.children.length; i++) {
                this.targetfruitNode.children[i].active = false;
            }
            this.endOne++;
        }

    }

    //  获取下落水果中位置最高的
    findHighestFruit() {
        let highest = this.fruitNode.children[0].y;
        for (let i = 1; i < this.fruitNode.children.length; i++) {
            let high = this.fruitNode.children[i].y + this.fruitNode.children[i].width / 2;
            if (highest < high) {
                highest = high;
            }
        }
        return highest;
    }

}
