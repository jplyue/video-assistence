<template>
  <div></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import pako from 'pako'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'WebSocketComponent',
  props: {
    text: String
  },
  setup(props, { emit }) {
    const ws = ref(null)
    const connected = ref(false)
    const messageQueue = ref([])
    const isWaiting = ref(false)

    const startWebSocket = () => {
      if (ws.value) {
        ws.value.close()
      }

      ws.value = new WebSocket('ws://localhost:8080/ws')
      ws.value.binaryType = 'arraybuffer'

      ws.value.onopen = () => {
        console.log('WebSocket is open now.')
        connected.value = true
        if (props.text) {
          sendMessages(props.text)
        }
      }

      ws.value.onmessage = (event) => {
        console.log('Message received:', event.data)
        processMessage(event.data)
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.value.onclose = () => {
        console.log('WebSocket connection closed')
        connected.value = false
        resetState()
      }
    }

    const resetWebSocket = () => {
      resetState()
      startWebSocket()
    }

    const sendMessages = (text) => {
      if (!connected.value) {
        console.error('WebSocket is not connected.')
        return
      }

      if (!text) {
        console.error('Text input is empty, not sending message.')
        return
      }

      const textParts = splitText(text, 1020)
      console.log('textParts', textParts)
      messageQueue.value = textParts

      // Start sending the first message
      if (!isWaiting.value) {
        sendNextMessage()
      }
    }

    const sendNextMessage = () => {
      if (messageQueue.value.length > 0) {
        const part = messageQueue.value.shift()
        isWaiting.value = true
        sendMessage(part)
      }
    }

    const sendMessage = (text) => {
      const requestJson = {
        app: {
          appid: '8956125897',
          token: 'u8KnLs3E-szjKKNjV6XpNXytU8dDH5Hu',
          cluster: 'volcano_tts'
        },
        user: {
          uid: 'uid123'
        },
        audio: {
          voice_type: 'BV700_streaming',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0,
          emotion: 'happy',
          language: 'cn'
        },
        request: {
          reqid: uuidv4(),
          text: text,
          text_type: 'plain',
          operation: 'query',
          silence_duration: '125',
          with_frontend: '1',
          frontend_type: 'unitTson',
          pure_english_opt: '1'
        }
      }

      ws.value.send(JSON.stringify(requestJson))
      console.log('Message sent:', requestJson)
    }

    const splitText = (text, maxSize) => {
      const encoder = new TextEncoder()
      const textArray = encoder.encode(text)
      const textParts = []
      let startIndex = 0

      while (startIndex < textArray.length) {
        let endIndex = startIndex + maxSize
        if (endIndex > textArray.length) {
          endIndex = textArray.length
        }

        const partArray = textArray.slice(startIndex, endIndex)
        const partText = new TextDecoder().decode(partArray)
        textParts.push(partText)
        console.log('Split text part:', partText)
        startIndex = endIndex
      }

      return textParts
    }

    const processMessage = (data) => {
      const view = new DataView(data)

      const headerSize = view.getUint8(0) & 0x0f
      const messageType = view.getUint8(1) >> 4
      const messageTypeSpecificFlags = view.getUint8(1) & 0x0f
      const messageCompression = view.getUint8(2) & 0x0f

      let payload = new Uint8Array(data.slice(headerSize * 4))

      if (messageType === 0xb && messageTypeSpecificFlags !== 0) {
        const sequenceNumberValue = view.getInt32(headerSize * 4, false)
        const payloadSize = view.getUint32(headerSize * 4 + 4, false)
        payload = new Uint8Array(data.slice(headerSize * 4 + 8, headerSize * 4 + 8 + payloadSize))

        console.log(`Sequence Number: ${sequenceNumberValue}`)
        console.log(`Payload Size: ${payloadSize} bytes`)

        emit('audioPartReady', payload)

        if (sequenceNumberValue < 0) {
          console.log('audioComplete')
          emit('audioComplete')
        }

        isWaiting.value = false
        sendNextMessage()
      } else if (messageType === 0xf) {
        const code = view.getUint32(headerSize * 4, false)
        const msgSize = view.getUint32(headerSize * 4 + 4, false)
        let errorMsg = new Uint8Array(data.slice(headerSize * 4 + 8, headerSize * 4 + 8 + msgSize))
        if (messageCompression === 1) {
          errorMsg = pako.inflate(errorMsg)
        }
        const errorString = new TextDecoder('utf-8').decode(errorMsg)
        console.error('Error message:', errorString)
      } else if (messageType === 0xc) {
        const msgSize = view.getUint32(headerSize * 4, false)
        payload = new Uint8Array(data.slice(headerSize * 4 + 4, headerSize * 4 + 4 + msgSize))
        if (messageCompression === 1) {
          payload = pako.inflate(payload)
        }
        const frontendMessage = new TextDecoder('utf-8').decode(payload)
        console.log('Frontend message:', frontendMessage)
      } else {
        console.log('Undefined message type!')
      }
    }

    const resetState = () => {
      messageQueue.value = []
      isWaiting.value = false
      if (ws.value) {
        ws.value.close()
      }
    }

    onMounted(() => {
      startWebSocket()
    })

    onUnmounted(() => {
      resetState()
    })

    watch(
      () => props.text,
      (newText) => {
        if (newText) {
          sendMessages(newText)
        }
      }
    )

    return {
      ws,
      connected,
      startWebSocket,
      sendMessages,
      sendMessage,
      splitText,
      processMessage,
      resetWebSocket
    }
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
