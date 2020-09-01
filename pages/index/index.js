import { createScopedThreejs } from 'threejs-miniprogram'

let canvas = undefined
let THREE = undefined
let height = 0
let width = 0

Page({
  onTouchStart(e) {
    if(e.touches.length === 0) return
    
    console.log(e, this.sphere.rotation.y + ":" + this.sphere.rotation.x)
    const { x, y } = e.changedTouches[0]
    this.startX = x
    this.startY = y
  },

  onTouchMove(e) {
    if (e.touches.length === 0) return
  
    let { x, y } = e.changedTouches[0]
    this.endX = x
    this.endY = y
    x = this.endX - this.startX
    y = this.endY - this.startY

    this.sphere.rotation.y = this.sphere.rotation.y - x * 0.002
    this.sphere.rotation.x = this.sphere.rotation.x - y * 0.002
    if (this.sphere.rotation.x < -1) {
      this.sphere.rotation.x = -1
    } else if (this.sphere.rotation.x > 1) {
      this.sphere.rotation.x = 1
    }
    if (this.sphere.rotation.y > Math.PI * 2) {
      this.sphere.rotation.y -= Math.PI * 2
    } else if (this.sphere.rotation.y < 0){
      this.sphere.rotation.y += Math.PI * 2
    }
    this.startX = this.endX
    this.startY = this.endY
  },

  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas').node().exec((res) => {
      canvas = res[0].node
      THREE = createScopedThreejs(canvas)
      query.select('#page').node().exec((res) => {
        const page = res[0].node
        height = page._height
        width = page._width
        this.draw()
      })
    })
  },

  draw() {
    // https://threejs.org/docs/#manual/zh/introduction/Creating-a-scene
    // 创建一个场景
    this.scene = new THREE.Scene()
    // 添加camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    this.camera.position.set(0,0,0)
    this.scene.add(this.camera)
    
    // https://threejs.org/docs/#api/zh/renderers/WebGLRenderer
    // 设置渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    })
    this.renderer.shadowMapEnabled = true // 设置阴影投射(这里好像不需要这个设置)
    this.renderer.setSize(width, height) // 设置渲染尺寸

    this.drawBall('https://mamba-blog-images.oss-cn-shanghai.aliyuncs.com/2020-06-10/1c3352744d88b048b14d02648a064fbd.jpg')
    
    // 开始渲染
    canvas.requestAnimationFrame(this.loop, canvas)
  },
  drawBall(url){
    // 创建球体，摄像机固定在球心
    const geometry = new THREE.SphereGeometry(50, 32, 32) 
    const texture = new THREE.TextureLoader().load(url) // 创建贴图
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }) // 创建纹理； side: 渲染哪那一面，这里是反面
    this.sphere = new THREE.Mesh(geometry, material) // 球体加载纹理
    this.sphere.name = "vrball"
    this.sphere.position.set(0,0,0) // 设置球体坐标，这里应该指的是球心在scene中的坐标，保持和camera的坐标一致就行
    this.scene.add(this.sphere) // 将球体添加至场景(scene)中
  },
  loop() {
    this.renderer.render(this.scene, this.camera)
    canvas.requestAnimationFrame(this.loop, canvas)
  }
})
