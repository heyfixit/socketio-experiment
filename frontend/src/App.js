import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { messageReceived } from './actions';

const endpoint =
  process.env.NODE_ENV === 'production'
    ? 'https://socketio-experiment.herokuapp.com:4000'
    : 'http://localhost:4000';

const AppWrapper = styled.div``;

const Canvas = styled.canvas`
  background-color: black;
`;

const App = props => {
  const [canvas] = useState(React.createRef());
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoords, setLastCoords] = useState(null);
  const [socket, setSocket] = useState(null);
  const [color] = useState(() => {
    const colors = [];
    for (let i = 0; i < 3; i++) {
      colors.push(Math.floor(Math.random() * 255));
    }
    return `rgb(${colors.join(',')})`;
  });

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
        onMouseUp={() => {
          setIsDrawing(false);
          socket.emit('drawing', { drawing: false });
        }}
        onMouseDown={e => {
          setLastCoords({
            x: e.clientX,
            y: e.clientY
          });
          setIsDrawing(true);
          socket.emit('drawing', {
            drawing: true,
            color,
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
            ctx.strokeStyle = color;
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
            socket.emit('draw-line', {
              color,
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
