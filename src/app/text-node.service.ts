import { Injectable } from '@angular/core';
import Konva from 'konva'

@Injectable({
  providedIn: 'root'
})
export class TextNodeService {

  constructor() { }

  textNode(stage: Konva.Stage, layer: Konva.Layer) {
    const textNode = new Konva.Text({
      text: 'type here',
      x: 50,
      y: 80,
      fontSize:20,
      draggable: true,
      width: 200
    })
    
    layer.add(textNode)

    let tr = new Konva.Transformer({
      node: textNode as any,
      enabledAnchors: ['middle-left', 'middle-right'],
      boundBoxFunc: function(oldBox, newBox) {
        newBox.width = Math.max(30, newBox.width)
        return newBox
      }
    })

    stage.on('click', function(e) {
      var shape = this.getIntersection(this.getPointerPosition());
      this.clickStartShape = shape;
      if(!this.clickStartShape) {
        return
      }
      if(e.target._id == this.clickStartShape._id) {
        layer.add(tr)
        tr.attachTo(e.target)
        layer.draw()
      } else {
        tr.detach()
        layer.draw()
      }
    })

    textNode.on('transform', function() {
      textNode.setAttrs({
        width: textNode.width() * textNode.scaleX(),
        scaleX: 1
      })
    })

    layer.add(tr)
    layer.draw()

    textNode.on('dbclick', () => {
      textNode.hide()
      tr.hide()
      layer.draw()

      let textPosition = (textNode as any).absolutePosition()
      let stageBox = stage.container().getBoundingClientRect()

      let areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y
      }

      let textarea = document.createElement("textarea")
      document.body.appendChild(textarea)

      textarea.value = textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.top = areaPosition.y + 'px'
      textarea.style.left = areaPosition.x + 'px'
      textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px'
      textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + 'px'
      textarea.style.fontSize = textNode.fontSize() + 'px'
      textarea.style.border = 'none'
      textarea.style.padding = '0px'
      textarea.style.margin = '0px'
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'none'
      textarea.style.outline = 'none'
      textarea.style.resize = 'none';

      (textarea as any).style.lineHeight = textNode.lineHeight()
      textarea.style.fontFamily = textNode.fontFamily()
      textarea.style.transformOrigin = 'left top'
      textarea.style.textAlign = textNode.align()
      textarea.style.color = textNode.fill()

      let rotation = textNode.rotation()
      let transform = ''
      if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)'
      }
      let px = 0
      let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
      if(isFirefox) {
        px += 2 + Math.round(textNode.fontSize() / 20)
      }

      transform += 'translateY(-' + px + 'px)'
      textarea.style.transform = transform

      textarea.style.height = textarea.scrollHeight + 3 + 'px'
      textarea.focus()

      function removeTextArea() {
        textarea.parentNode.removeChild(textarea)
        window.removeEventListener('click', handleOutsideClick)
        textNode.show()
        tr.show()
        tr.forceUpdate()
        layer.draw()
      }

      function setTextAreaWidth(newWidth) {
        if(!newWidth) {
          newWidth = (textNode as any).placeholder.length * textNode.fontSize()
        }

        let isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        )

        let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

        if(isSafari || isFirefox) {
          newWidth = Math.ceil(newWidth)
        }

        let isEdge = (document as any).documentMode || /Edge/.test(navigator.userAgent)
        if(isEdge) {
          newWidth += 1
        }
        textarea.style.width = newWidth + 'px'
      }

      textarea.addEventListener('keydown', function(e) {
        if(e.keyCode === 13 && !e.shiftKey) {
          textNode.text(textarea.value)
          removeTextArea()
        }
        if(e.keyCode === 27) {
          removeTextArea()
        }
      })

      textarea.addEventListener('keydown', function (e) {
        let scale = textNode.getAbsoluteScale().x
        setTextAreaWidth(textNode.width() * scale)
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px'
      })

      function handleOutsideClick(e) {
        if(e.target !== textarea) {
          removeTextArea()
        }
      }
      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick)
      })
    })

    return { textNode, tr }
  }

}
