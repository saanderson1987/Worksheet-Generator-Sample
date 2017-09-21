import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';

const responseTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const problemIdx = props.problemIdx;
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    const clientOffset = monitor.getClientOffset();

    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    let hoverIndex = props.respIdx;
    if (hoverClientX > hoverMiddleX) {
      hoverIndex ++;
    }

    if (dragIndex !== null) {
      if (dragIndex === hoverIndex) {
        return;
      }
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      props.moveBlank(dragIndex, hoverIndex, problemIdx);
    } else {
      props.dropBlank(problemIdx, hoverIndex);
    }

    monitor.getItem().index = hoverIndex;
    console.log(dragIndex, hoverIndex);
  },
};

class Response extends React.Component {
  render() {
    const { connectDropTarget, opaque } = this.props;
    // const isActive = canDrop && isOver;
    const opacity = opaque ? 0 : 1;
    return connectDropTarget(
      <div style={{opacity}} className='response'>
        {this.props.children}
      </div>
    );
  }
}

export default DropTarget(ItemTypes.NEWBLANK, responseTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  // isOver: monitor.isOver(),
  // canDrop: monitor.canDrop(),
}))(Response);