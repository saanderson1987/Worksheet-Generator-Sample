import React from 'react';
// import { Meteor } from 'meteor/meteor';
// import { createContainer } from 'meteor/react-meteor-data';
import AutosizeInput from 'react-input-autosize';
import {cloneDeep} from 'lodash';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';
import shortid from 'shortid';

import Instructions from '../DocForm/Instructions.jsx';
import Problems from './Problems.jsx';
import ButtonRow from '../ui/ButtonRow.jsx';
import Toolbox from './Toolbox.jsx';

class EditDocForm extends React.Component {
  constructor(props) {
    super(props);
    this.updateDoc = this.updateDoc.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleQuestionInput = this.handleQuestionInput.bind(this);
    this.handleTextPiecesInput = this.handleTextPiecesInput.bind(this);
    this.moveProblem = this.moveProblem.bind(this);
    this.addNewProblem = this.addNewProblem.bind(this);
    this.makeProbVisible = this.makeProbVisible.bind(this);
    this.dropBlank = this.dropBlank.bind(this);
    this.moveBlank = this.moveBlank.bind(this);
    this.removeBlank = this.removeBlank.bind(this);
    this.removeProblem = this.removeProblem.bind(this);
    this.makeProbVisible = this.makeProbVisible.bind(this);
    this.splitText = this.splitText.bind(this);
    this.rejoinText = this.rejoinText.bind(this);
    this.state = {
      docName: '',
      instructions: 'Fill in the blanks with the words in the bank.',
      includeWordBank: true,
      problems: [
        {
          id: shortid.generate(),
          textPieces: [
            {
              text : "Three days was simply not a(n)",
              blank : false,
              id: shortid.generate(),
            },
            {
              text : "acceptable",
              blank : true,
              id: shortid.generate(),
            },
            {
              text : "amount of time to complete such a lot of work.",
              blank : false,
              id: shortid.generate(),
            }
          ]
        },
        {
          id: shortid.generate(),
          textPieces: [
            {
              text : "You don't need to be a(n)",
              blank : false,
              id: shortid.generate(),
            },
            {
              text : "genius",
              blank : true,
              id: shortid.generate(),
            },
            {
              text : "to see what the problem here is.",
              blank : false,
              id: shortid.generate(),
            },
          ]
        },
        {
          id: shortid.generate(),
          textPieces: [
            {
              text : "Make sure you read all the",
              blank : false,
              id: shortid.generate(),
            },
            {
              text : "instructions",
              blank : true,
              id: shortid.generate(),
            },
            {
              text : "carefully before setting up the device",
              blank : false,
              id: shortid.generate(),
            },
          ]
        },
      ],
      submitStatus: '',
    };
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.doc !== {}) {
  //     this.setState( nextProps );
  //   }
  // }

  render() {
    return (
      <div>
        <div className='edit-doc-container'>
          <div>
            <div style={{width: '600px', margin: '20px 0px', padding: '10px', background: '#e2e2e2'}}>This page offers a sample of the Worksheet Generator app while it is in progress. This is where users can edit their worksheets. It showcases the drag-and-drop feature, allowing users to easily add new problems and blanks.</div>
            <input
              name='docName'
              value={ this.state.docName }
              placeholder='Document name   '
              className='header-lg'
              onChange={ this.handleInput()}
            />
            <Instructions
              instructions={this.state.instructions}
              edit={true}
              handleInput={this.handleInput}
            />
            <div className='section'>
              <div>
                <input
                  name='includeWordBank'
                  type='checkbox'
                  checked={this.state.includeWordBank}
                  onChange={this.handleInput()}
                />
                Include word bank
              </div>
              <div style={{fontStyle: 'italic'}}>
                Word bank will be automatically populated using the words in the blanks
              </div>
            </div>
            <div className='section problems-container'>
              <Problems
                problems={this.state.problems}
                moveProblem={this.moveProblem}
                addNewProblem={this.addNewProblem}
                makeProbVisible={this.makeProbVisible}
                removeBlank={this.removeBlank}
                handleQuestionInput={this.handleQuestionInput}
                handleTextPiecesInput={this.handleTextPiecesInput}
                dropBlank={this.dropBlank}
                moveBlank={this.moveBlank}
              />
              <Toolbox
                removeProblem={this.removeProblem}
                makeProbVisible={this.makeProbVisible}
                splitText={this.splitText}
                rejoinText={this.rejoinText}
              />
            </div>
            {/* <ButtonRow>
              <button>Cancel</button>
              <button className='button_green' onClick={this.updateDoc}>Save Changes</button>
            </ButtonRow> */}
          </div>
        </div>
      </div>
    );
  }

  dropBlank(problemIdx, textPieceIdx) {
    // Don't allow blank to be dropped on a spot right after another blank
    const prevTextPiece = this.state.problems[problemIdx].textPieces[textPieceIdx - 1];
    if (prevTextPiece && prevTextPiece.blank) {
      return;
    }
    const problems = cloneDeep(this.state.problems);
    problems[problemIdx].textPieces.splice(textPieceIdx, 0, {
      text: '',
      blank: true,
      id: shortid.generate(),
    });
    const nextTextPiece = problems[problemIdx].textPieces[textPieceIdx + 1];
    if (!nextTextPiece) {
      problems[problemIdx].textPieces.splice(textPieceIdx + 1, 0, {
        text: '',
        blank: false,
        id: shortid.generate(),
      });
    }
    this.setState({ problems });
  }

  moveBlank(dragIndex, hoverIndex, problemIdx) {
    // If user tries to move last blank to space after last textPiece text,
    // don't move
    if (hoverIndex - dragIndex === 1) {
      return dragIndex;
    }
    // Don't allow blank to be moved to a spot right after another blank
    const prevTextPiece = this.state.problems[problemIdx].textPieces[hoverIndex - 1];
    if (prevTextPiece && prevTextPiece.blank) {
      return;
    }
    if (dragIndex !== 0 && hoverIndex - dragIndex === 2 && hoverIndex === this.state.problems[problemIdx].textPieces.length) {
      return dragIndex;
    }
    const problems = cloneDeep(this.state.problems);
    const textPieces = problems[problemIdx].textPieces;
    const dragBlank = textPieces.splice(dragIndex, 1)[0];
    textPieces.splice(hoverIndex, 0, dragBlank);
    // Delete blank textPiece at the end of the problem text that's
    // automatically added after a blank added to the end if this blank
    // is moved.
    if (textPieces[dragIndex + 1] && textPieces[dragIndex + 1].text === '') {
      textPieces.splice(dragIndex + 1, 1);
    }
    if (dragIndex === 0 && !textPieces[hoverIndex + 1]) {
      textPieces.push ({
        text: '',
        blank: false,
        id: shortid.generate(),
      });
    }
    this.setState({ problems });
    let newIndex = problems[problemIdx].textPieces.indexOf(dragBlank);
    console.log (newIndex);
    return newIndex;
  }

  removeBlank(problemIdx, textPieceIdx) {
      event.preventDefault();
      const problems = cloneDeep(this.state.problems);
      const textPieces = problems[problemIdx].textPieces;
      textPieces.splice(textPieceIdx, 1);
      if (textPieceIdx > 0) {
        // Combine the textPiece text that followed the blank with the textPiece text
        // that came before the blank. Inner if condition checks if there
        // were text, because there weren't, it messes up placeholder text.
        if (textPieces[textPieceIdx].text) {
          textPieces[textPieceIdx - 1].text += ' ' + textPieces.splice(textPieceIdx, 1)[0].text;
        } else {
          textPieces.splice(textPieceIdx, 1);
        }
      }
      this.setState({ problems });
  }

  moveProblem(dragIndex, hoverIndex) {
    // const problems = cloneDeep(this.state.problems);
    // const dragProblem = problems.splice(dragIndex, 1)[0];
    // problems.splice(hoverIndex, 0, dragProblem);
    // this.setState({ problems });

    const { problems } = this.state;
    const dragProblem = problems[dragIndex];
    dragProblem.opaque = true;
    this.setState(update(this.state, {
      problems: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragProblem],
        ],
      },
    }));
  }

  addNewProblem(idx) {
    const problem = {
      id: shortid.generate(),
      textPieces: [
        {
          text: '',
          blank: false,
          id: shortid.generate(),
        }
      ],
      opaque: true
    };
    const problems = cloneDeep(this.state.problems);
    problems.splice(idx, 0, problem);
    this.setState( prevState => {
      return {problems};
    });
  }

  removeProblem(idx) {
    const problems = cloneDeep(this.state.problems);
    problems.splice(idx, 1);
    this.setState({ problems });
  }

  makeProbVisible(idx) {
    const problems = cloneDeep(this.state.problems);
    problems[idx].opaque = false;
    this.setState({ problems });
  }

  handleInput() {
    return (event) => {
      const name = event.target.name;
      const value = event.target.type === 'checkbox' ?
        event.target.checked :
        event.target.value;
      this.setState({ [name]: value });
    };
  }

  handleQuestionInput(problemIdx) {
    return (event) => {
        const value = event.target.value;
        const problems = cloneDeep(this.state.problems);
        problems[problemIdx].question = value;
        this.setState( { problems });
      };
  }

  handleTextPiecesInput(problemIdx, textPieceIdx) {
    return (event) => {
      const value = event.target.value;
      const problems = cloneDeep(this.state.problems);
      problems[problemIdx].textPieces[textPieceIdx].text = value;
      this.setState({ problems });
    };
  }

  splitText() {
    // Goes through the textPieces of each problem and splits the text
    // of each textPiece so that every word is a textPiece.
    const problems = cloneDeep(this.state.problems);
    for (let h = 0; h < problems.length; h++) {
      let textPieces = problems[h].textPieces;
      let newTextPieces = [];
      for (let i = 0; i < textPieces.length; i++) {
        let textPiece = textPieces[i];
        if (textPiece.blank) {
          newTextPieces.push(textPiece);
        } else {
          let textArr = textPiece.text.split(' ');
          for (let j = 0; j < textArr.length; j++) {
            newTextPieces.push({
              text: textArr[j],
              blank: false,
              id: shortid.generate(),
            });
          }
        }
      }
      problems[h].textPieces = newTextPieces;
    }
    this.setState({problems});
  }

  rejoinText() {
    const problems = cloneDeep(this.state.problems);
    for (let h = 0; h < problems.length; h++) {
      let textPieces = problems[h].textPieces;
      let newTextPieces = [];
      // debugger;
      for (let i = 0; i < textPieces.length; i++) {
        let textPiece = textPieces[i];
        if (textPiece.blank) {
          newTextPieces.push(textPiece);
        } else {
          // let prevTextPiece = textPieces[i-1];
          let prevTextPiece = newTextPieces[newTextPieces.length - 1];
          if (i === 0 || prevTextPiece.blank) {
            newTextPieces.push(textPiece);
          } else {
            prevTextPiece.text += ' ' + textPiece.text;
          }
        }
      }
      problems[h].textPieces = newTextPieces;
    }
    this.setState({problems});
  }

  updateDoc(event) {
    event.preventDefault();
    // const { docName, problems } = this.state;
    // // make sure to grab the uneditable fields of the document so that
    // // they are not erased with the update method. Update method replaces
    // // the document if not mongo update modifiers are specified. It does
    // // not replace the field _id.
    // // They will probably be this.props.<whatever>
    // Meteor.call('documents.upsert', { docName, problems },
    //   (err, res) => {
    //     const submitStatus = err ? 'Error, check console log' : 'SUCCESS!';
    //     console.log(err);
    //     this.setState({ submitStatus });
    // });
  }

}

export default DragDropContext(HTML5Backend)(EditDocForm);
