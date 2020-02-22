import { TEXTS } from "../res/text/text.js"


/**
 * テキストウィンドウクラス
 * コンストラクタ引数 {
 *   id:        テキストのid
 *   textSpeed: テキスト送りの速度
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */
export class TextWindow extends PIXI.Container {
    constructor (c = null) {
        super(c);

        this.id = c.id
        this.textSpeed = c.textSpeed
        this.cursor = 0
        this.msgEnd = false

        this.x = c.x
        this.y = c.y

        // ウィンドウ
        let window = new PIXI.Graphics()
        .lineStyle(5, 0xffffff)
        .beginFill(0x000000)
        .drawRoundedRect(0,0, c.width, c.height, 10)
        .endFill()
        window.alpha = 0.75
        window.pivot.x = c.width / 2
        window.pivot.y = c.height / 2

        // テキストラベル
        let textLabel = new PIXI.Text( '', c.textStyle );
        textLabel.x = 0
        textLabel.y = 0
        textLabel.x = c.textStyle.fontSize ? -c.width / 2 + c.textStyle.fontSize : -c.width / 2
        textLabel.y = c.textStyle.lineHeight ? -c.height / 2 +  c.textStyle.lineHeight : -c.height / 1.5
        
        // テキスト送りボタン
        let btnNextMsg = new PIXI.Graphics()
        .lineStyle(0, 0xffffff)
        .beginFill(0xffffff)
        .drawPolygon([
            0, 0,
            30, 0,
            15, 25
        ])
        .endFill()
        btnNextMsg.alpha = 0.9
        btnNextMsg.scale.x = btnNextMsg.scale.y = 0.9
        btnNextMsg.pivot.x = btnNextMsg.pivot.y = 0.5 
        btnNextMsg.x = window.x + c.width / 2 - 60
        btnNextMsg.y = window.y + c.height / 2 - 45
        btnNextMsg.tween = TweenMax.to(btnNextMsg, 0.75,
            {  pixi:
                { alpha: 0.2 }, ease: Power0.easeNone, repeat: -1, yoyo: true,
            }
        )
        btnNextMsg.visible = false;

        // ウィンドウ閉じるボタン
        let btnCloseWindow = new PIXI.Graphics()
        .lineStyle(4, 0xffffff)   
        .moveTo(0,0)              
        .lineTo(25,25)             
        .moveTo(25,0)     
        .lineTo(0,25);
        btnCloseWindow.scale.x = btnCloseWindow.scale.y = 0.9
        btnCloseWindow.pivot.x = btnCloseWindow.pivot.y = 0.5 
        btnCloseWindow.x = window.x + c.width / 2 - 58
        btnCloseWindow.y = window.y + c.height / 2 - 45
        btnCloseWindow.tween = TweenMax.to(btnCloseWindow, 0.75,
            {  pixi:
                { alpha: 0.2 }, ease: Power0.easeNone, repeat: -1, yoyo: true,
            }
        )
        btnCloseWindow.visible = false;



        // イベントリスナー設定
        window.interactive = true
        textLabel.interactive = true
        btnNextMsg.interactive = true
        btnNextMsg.buttonMode = true
        this._tap = this.tap.bind(this)
        window.on('pointertap', this._tap)
        textLabel.on('pointertap', this._tap)
        btnNextMsg.on('pointertap', this._tap)

        btnCloseWindow.interactive = true
        btnCloseWindow.buttonMode = true

        // ウィンドウ閉じるリスナー
        this.closeWindowListner = undefined;
        

        // thisで保持
        this.window = window
        this.btnNextMsg = btnNextMsg
        this.textLabel = textLabel
        this.btnCloseWindow = btnCloseWindow

        this.text = TEXTS["SCRIPTS"][this.id][0]
        this.streamTimer = null
        this.waitNext = false
        this.addChild(window)
        this.addChild(btnNextMsg)
        this.addChild(textLabel)
        this.addChild(btnCloseWindow)

        this.next()
    }   

    /**
     * ユーザーアクションにしたがってなんかする 
     */
    tap(e) {
        // 表示が完了していれば次の文章へ、そうでなければ一括表示
         this.waitNext ? this.next() : this.flush()
    }


    /**
     * 次の1文へ
     */
    next() {
        this.textLabel.text = ""
        this.text  = TEXTS["SCRIPTS"][this.id][this.cursor]
        this.stream()

        this.cursor++
    }

    /**
     * 1文字ずつ表示
     */
    stream() {
        this.btnNextMsg.visible = false
        this.waitNext = false
        function* getNextChar() {
            let index = 0
            while(this.text[index] !== undefined) {
                yield this.text[index++]
            }
            yield ''
        }
        const itr = getNextChar.call(this)
        this.streamTimer = setInterval(() => {
            let n = itr.next()
            if (!n.done) {
                this.textLabel.text += n.value
            }
            else {
                clearInterval(this.streamTimer)
                this.waitNext = true;
                this.btnNextMsg.visible = true
                this.checkTextEnd()
            }

        }, this.textSpeed)
    }

    /**
     * 一括表示
     */
    flush() {
        clearInterval(this.streamTimer)
        this.textLabel.text  = this.text
        this.waitNext = true
        this.btnNextMsg.visible = true
        this.checkTextEnd()
    }

    /**
     * 
     */
    checkTextEnd() {
        if ( TEXTS["SCRIPTS"][this.id][this.cursor] === undefined) {
            // テキストが終わりなら閉じる待機
            this.btnNextMsg.visible = false
            this.btnCloseWindow.visible = true;
            this.window.off('pointertap', this._tap)
            this.btnNextMsg.off('pointertap', this._tap)
            this.textLabel.off('pointertap', this._tap)
            if (this.closeWindowListner != null) {
                this.window.on('pointertap', this.closeWindowListner)
                this.btnCloseWindow.on('pointertap', this.closeWindowListner)     
            }       
        }
    }


    /**
     * ウィンドウ閉じる時のリスナー設定
     */
    setCloseWindowListener(listener = null) {
        this.closeWindowListner = listener;
    }
    removeClickEventListner() {
        this.closeWindowListner = null;
    }
}