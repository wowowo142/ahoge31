/**
 * pixiでゲームUIを作ってみる
 */

// import '@babel/polyfill';
import { TextWindow } from "./UI.js"

let w = 800
let h = 600


// グローバル
let textures// = new Map()
let app


/**
 * 指定したurlの画像からテクスチャを生成してグローバルなMapにセット
 * @param {String} name 
 * @param {String} url
 */
function loadTexture(name, url) {
    let tex = PIXI.Texture.from(url)
    textures.set(name, tex)
    return tex
}

init()

function init() {
    textures = new Map()
    
    loadTexture('enkan','./res/img/uyuyuhuh.png')
    loadTexture('background','./res/img/newspaper.jpg')
    loadTexture('sansukumi','./res/img/asdf.png')

    // PIXIアプリケーション生成
    app = new PIXI.Application({
            width: w, height: h,
            backgroundColor: 0xffffff,
            // resolution: window.devicePixelRatio || 1,
    })

    // HTMLに追加
    let gameEl = document.getElementById('game')
    gameEl.innerHTML = ''
    gameEl.appendChild(app.view)


    // 日本語テキストのベースライン調整
    PIXI.TextMetrics.BASELINE_SYMBOL += "あ｜";

    /**
     * 背景
     */
    let back = new PIXI.Sprite(textures.get('background'))
    back.alpha = 0.3
    back.scale.x = back.scale.y = w / 1920;

    let enkan = new PIXI.Sprite(textures.get('enkan'))
    enkan.alpha = 0.5
    enkan.anchor.set(0.445, 0.5)
    enkan.tween = TweenMax.to(enkan, 9.0,
        {  pixi:
            { rotation: 360 }, ease: Power0.easeNone, repeat: -1,
        }
    )
    enkan.x = app.screen.width / 2 - 5
    enkan.y = app.screen.height / 2 - 10

    let sansukumi = new PIXI.Sprite(textures.get('sansukumi'))
    sansukumi.scale.x = sansukumi.scale.y = 1.2
    sansukumi.anchor.set(0.5, 0.5);
    sansukumi.x = app.screen.width / 2
    sansukumi.y = app.screen.height / 2
    sansukumi.tint = 0xffffff

    app.stage.addChild(back)
    app.stage.addChild(enkan)
    app.stage.addChild(sansukumi)

    app.stage.interactive = true
    app.stage.on('pointertap', showMessage)


    function showMessage() {
        app.stage.off('pointertap', showMessage)
            
        /**
         * BGM
         */
        const bgm = PIXI.sound.Sound.from({
            url: './res/sound/n38.mp3',
            autoPlay: true,
        });


        /**
         * UI
         */
        let messageContainer = new PIXI.Container();
        messageContainer.x = messageContainer.y = 0


        let mw = { w: app.screen.width  * 0.95, h: app.screen.height  * 0.25 }

        let textWindow1 = new TextWindow(
            {
                id: 0,
                width: app.screen.width  * 0.95,
                height: app.screen.height  * 0.25,
                x: app.screen.width / 2,
                y: app.screen.height - mw.h - 10,
                textStyle: {
                    fontFamily : 'Noto Sans CJK JP, 游ゴシック,Osaka',
                    fontWeight: 'bold',
                    lineHeight: 32,
                    fontSize: 21,
                    fill:0xffffff 
                },
                textSpeed: 100
            }
        )
        textWindow1.setCloseWindowListener(() => {
            textWindow1.destroy()
            bgm.stop()
        })
        
        messageContainer.addChild(textWindow1)
        app.stage.addChild(messageContainer)
    }
}