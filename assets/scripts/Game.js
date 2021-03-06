// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,

        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: cc.Node
        },

        // score label 的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        },

        score: {
            default: 0,
            displayName: "Score (player)",
            tooltip: "The score of player"
        }
    },

    spawnNewStar: function () {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());

        newStar.getComponent('Star').game = this;
        this.timer = 0;
    },


    getNewStarPosition: function () {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        console.log('randX = ' + randX);
        // 返回星星坐标
        return cc.v2(randX, randY);
    },

    gainScore: function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function () {
        //var self = this;
        this.player.stopAllActions(); //停止 player 节点的跳跃动作        
        cc.sys.localStorage.setItem('score', this.score);
        console.log(`this.score = ${this.score}, localstorage.score = ${cc.sys.localStorage.getItem('score')}`);
        cc.director.loadScene('end_scene', (error, data) => {
            //cc.director.getScene().getChildByName('Canvas').getChildByName('title_game_total_value').string = `Total:${this.score}`;        
        });
    },

    update: function (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    onTouchStartCallback: function (event) {
        var loc = event.getLocation();

        console.log("onTouchStartCallback = " + loc.x);

        this.player.getComponent('Player').accLeft = false;
        this.player.getComponent('Player').accRight = false;
        if (loc.x > cc.winSize.width / 2) {
            this.player.getComponent('Player').accRight = true;
        } else {
            console.log("accLeft = true");
            this.player.getComponent('Player').accLeft = true;
        }
    },

    onTouchEndCallback: function (event) {
        var loc = event.getLocation();
        console.log("onTouchEndCallback = " + loc.x);

        this.player.getComponent('Player').accLeft = false;
        this.player.getComponent('Player').accRight = false;
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 4;
        //this.transitNode = this.node;
        //cc.game.addPersistRootNode(this.transitNode);

        // 初始化计分
        this.score = 0;
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 生成一个新的星星
        this.spawnNewStar();

        var touchReceiver = this.node;
        touchReceiver.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this);
        touchReceiver.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this);
    },

    start() { },

    onDestroy() {
        // var touchReceiver = cc.Canvas.instance.node;
        // touchReceiver.off(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this);
        // touchReceiver.off(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this);
    }
});
