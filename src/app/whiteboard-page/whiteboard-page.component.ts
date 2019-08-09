import { Component, OnInit } from '@angular/core';
import Konva from 'konva'
import { ShapeService } from '../shape.service'
import { TextNodeService } from '../text-node.service'

@Component({
  selector: 'app-whiteboard-page',
  templateUrl: './whiteboard-page.component.html',
  styleUrls: ['./whiteboard-page.component.css']
})
export class WhiteboardPageComponent implements OnInit {

  shapes: any = []
  stage: Konva.Stage
  layer: Konva.Layer
  selectedButton: any = {
    'circle': false,
    'rectangle': false,
    'line': false,
    'undo': false,
    'erase': false,
    'text': false
  }
  erase: boolean = false
  transformers: Konva.Transformer[] = []

  constructor(private shapeService: ShapeService, private textNodeService: TextNodeService) { }

  ngOnInit() {
    let width = window.innerWidth * 0.9
    let height = window.innerHeight
    this.stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    })
    this.layer = new Konva.Layer()
    this.stage.add(this.layer)
    this.addLineListeners()
  }

  clearSelection(){
    Object.keys(this.selectedButton).forEach(key => {
      this.selectedButton[key] = false
    })
  }

  setSelection(type: string) {
    this.selectedButton[type] = true
  }

  addShape(type: string) {
    this.clearSelection()
    this.setSelection(type)
    if(type == 'circle') {
      this.addCircle()
    } else if (type == 'line') {
      this.addLine()
    } else if (type == 'rectangle') {
      this.addRectangle()
    } else if (type == 'text') {
      this.addText()
    }
  }

  addText() {
    const text = this.textNodeService.textNode(this.stage, this.layer)
    this.shapes.push(text.textNode)
    this.transformers.push(text.tr)
  }

  addCircle() {
    const circle = this.shapeService.circle()
    this.shapes .push(circle)
    this.layer.add(circle)
    this.stage.add(this.layer)
    this.addTransformerListeners()
  }

  addRectangle() {
    const rectangle = this.shapeService.rectangle()
    this.shapes.push(rectangle)
    this.layer.add(rectangle)
    this.stage.add(this.layer)
    this.addTransformerListeners()
  }

  addLine() {
    this.selectedButton['line'] = true
  }

  addLineListeners() {
    const component = this
    let lastLine
    let isPaint
    this.stage.on('mousedown touchstart', e => {
      if(!component.selectedButton['line'] && !component.erase) {
        return
      }

      isPaint = true
      let pos = component.stage.getPointerPosition()
      const mode = component.erase ? 'erase' : 'brush'
      lastLine = component.shapeService.line(pos, mode)
      component.shapes.push(lastLine)
      component.layer.add(lastLine)
    })

    this.stage.on('mouseup touchend', () => {
      isPaint = false
    })

    this.stage.on('mousemove touchmove', () => {
      if(!isPaint) {
        return
      }

      const pos = component.stage.getPointerPosition()
      let newPoints = lastLine.points().concat([pos.x , pos.y])
      lastLine.points(newPoints)
      component.layer.batchDraw()
    })
  }

  undo() {
    const removeShape = this.shapes.pop()
    this.transformers.forEach(t => {
      t.detach()
    })

    if(removeShape) {
      removeShape.remove()
    }
    this.layer.draw()
  }

  addTransformerListeners() {
    const component = this
    const tr = new Konva.Transformer()
    this.stage.on('click', e => {
      /*if(!this.clickStartShape) {
        return
      }

      if(e.target._id == this.clickStartShape._id) {
        component.addDeleteListener(e.target)
        component.layer.add(tr)
        tr.attachTo(e.target)
        component.transformers.push(tr)
        component.layer.draw()
      } else {
        tr.detach()
        component.layer.draw()
      }*/
    })
  }

  addDeleteListener(shape) {
    const componenet = this
    window.addEventListener('keydown', e => {
      if (e.keyCode === 46) {
        shape.remove()
        componenet.transformers.forEach(t => {
          t.detach()
        })
        const selectedShape = componenet.shapes.find(s => s._id == shape._id)
        selectedShape.remove()
        e.preventDefault()
      }
      componenet.layer.batchDraw()
    })
  }

}
