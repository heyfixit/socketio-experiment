import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Color from 'color';

import { messageReceived } from './actions';

const randomColor = () => {
  const colors = [];
  for (let i = 0; i < 3; i++) {
    colors.push(Math.floor(Math.random() * 255));
  }
  return Color.rgb(colors);
};

const svgUrl = (svgString, width, height, viewBoxWidth, viewBoxHeight) => {
  viewBoxWidth = viewBoxWidth || width;
  viewBoxHeight = viewBoxHeight || width;
  return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}" height="${height}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">${svgString}</svg>')`;
};

const endpoint =
  process.env.NODE_ENV === 'production'
    ? window.location.hostname
    : 'http://localhost:4000';

const AppWrapper = styled.div``;

const Canvas = styled.canvas`
  background-color: black;
  cursor: ${props => {
    return `${svgUrl(
      `<circle cx="3" cy="3" r="3" fill="${props.cursorColor}" stroke="black"/>`,
      6,
      6,
      6,
      6
    )} 3 3, auto`;
  }};
`;

const App = props => {
  const [canvas] = useState(React.createRef());
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoords, setLastCoords] = useState(null);
  const [socket, setSocket] = useState(null);
  const [color, setColor] = useState(() => randomColor());
  const colorString = color.rgb().string();

  useEffect(() => {
    setSocket(socketIOClient(endpoint));
    const ctx = canvas.current.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    const handleResize = () => {
      const temp = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      ctx.putImageData(temp, 0, 0);
    };

    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('draw-line', data => {
        const ctx = canvas.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = data.color;
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
      });
    }
  }, [socket]);

  return (
    <AppWrapper>
      <Canvas
        ref={canvas}
        cursorColor={color}
        onWheel={e => {
          if (e.deltaY < 0) {
            setColor(color.lighten(0.1));
          } else {
            setColor(color.darken(0.1));
          }
        }}
        onMouseUp={() => {
          setIsDrawing(false);
          socket.emit('drawing', { drawing: false });
        }}
        onMouseDown={e => {
          if(e.button === 1) {
            setColor(randomColor());
            return;
          }
          setLastCoords({
            x: e.clientX,
            y: e.clientY
          });
          setIsDrawing(true);
          socket.emit('drawing', {
            drawing: true,
            color: colorString,
            coords: { x: e.clientX, y: e.clientY }
          });
        }}
        onMouseMove={e => {
          if (isDrawing) {
            const ctx = canvas.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(lastCoords.x, lastCoords.y);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = colorString;
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
            socket.emit('draw-line', {
              color: colorString,
              from: lastCoords,
              to: { x: e.clientX, y: e.clientY }
            });
            setLastCoords({
              x: e.clientX,
              y: e.clientY
            });
          }
        }}
      />
    </AppWrapper>
  );
};

const mapStateToProps = (state, _ownProps) => ({
  messages: state.messages
});

export default connect(
  mapStateToProps,
  { messageReceived }
)(App);
