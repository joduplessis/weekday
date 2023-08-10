import React from 'react'
import { connect } from 'react-redux'
import './boards.extension.css'
import PropTypes from 'prop-types'
import { hydrateTasks, updateChannelSections, createTasks, hydrateTask } from '../../actions'
import arrayMove from 'array-move'
import { sortTasksByOrder, classNames, logger } from '../../helpers/util'
import ColumnComponent from './components/column/column.component'
import GraphqlService from '../../services/graphql.service'

class BoardsExtension extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      notification: null,
      loading: false,
      shiftIndex: null,
      sections: [],
      nosection: false,
    }

    this.updatePosition = this.updatePosition.bind(this)
    this.shiftIndex = this.shiftIndex.bind(this)
    this.updateChannelSections = this.updateChannelSections.bind(this)
  }

  shiftIndex(index) {
    this.setState({ shiftIndex: index })
  }

  async updateChannelSections(sections) {
    const channelId = this.props.channel.id
    await GraphqlService.getInstance().updateChannelSections(channelId, sections)
    this.props.updateChannelSections(channelId, sections)
  }

  updatePosition(draggedSectionId, targetIndex) {
    if (!draggedSectionId) return

    let indexOfDraggedSection
    const sortedSections = this.state.sections

    // Get the CURRENT indexes
    sortedSections.map((section, index) => {
      if (section.id == draggedSectionId) indexOfDraggedSection = index
    })

    // Create a new array based on the new indexes
    const compensateForForwardDragging = indexOfDraggedSection < targetIndex
    const newTargetIndex = compensateForForwardDragging ? targetIndex - 1 : targetIndex
    const updatedSortedSections = arrayMove(sortedSections, indexOfDraggedSection, newTargetIndex)
    const sections = this.state.sections.map(section => {
      let updatedOrderForThisSection

      // Now we look for this section - but we use the index as order
      updatedSortedSections.map((s, i) => {
        if (s.id == section.id) updatedOrderForThisSection = i
      })

      return {
        ...section,
        order: updatedOrderForThisSection,
      }
    })

    // Update out API
    this.updateChannelSections(sortTasksByOrder(sections))

    // Update the state with the new order
    this.setState({
      sections: sortTasksByOrder(sections),
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.channelId != prevProps.match.params.channelId) {
      this.fetchTasks()
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      nosection: props.tasks.filter(task => !task.sectionId).length != 0,
      sections: sortTasksByOrder(props.channel.sections),
    }
  }

  componentDidMount() {
    this.fetchTasks()
  }

  async fetchTasks() {
    try {
      const { channelId, teamId } = this.props.match.params
      const { data } = await GraphqlService.getInstance().tasks({
        parent: null,
        team: teamId,
        channel: channelId,
      })

      this.props.hydrateTasks(data.tasks || [])
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  render() {
    return (
      <div className="boards-extension">
        <div className="scroll-container">
          <div className="scroll-content">
            <div className="boards-container">
              {this.state.nosection && (
                <ColumnComponent
                  nosection
                  shift={false}
                  shiftIndex={() => console.log('No')}
                  id={null}
                  order={-1}
                  last={false}
                  index={-1}
                  title="No section"
                  updatePosition={this.updatePosition}
                />
              )}

              {this.state.sections.map((section, index) => {
                let shift = this.state.shiftIndex != null && index >= this.state.shiftIndex

                return (
                  <ColumnComponent
                    shift={shift}
                    shiftIndex={this.shiftIndex}
                    select={true}
                    key={index}
                    id={section.id}
                    order={section.order}
                    index={index}
                    last={false}
                    title={section.title}
                    updatePosition={this.updatePosition}
                  />
                )
              })}

              <ColumnComponent
                new
                shift={this.state.shiftIndex != null && this.state.sections.length >= this.state.shiftIndex}
                shiftIndex={() => console.log('No')}
                id="new"
                order={0}
                last={true}
                index={this.state.sections.length}
                title="New"
                updatePosition={this.updatePosition}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

BoardsExtension.propTypes = {
  user: PropTypes.any,
  channel: PropTypes.any,
  team: PropTypes.any,
  tasks: PropTypes.any,
  hydrateTasks: PropTypes.func,
  updateChannelSections: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateTasks: tasks => hydrateTasks(tasks),
  createTasks: (channelId, task) => createTasks(channelId, task),
  updateChannelSections: (channelId, sections) => updateChannelSections(channelId, sections),
}

const mapStateToProps = state => {
  return {
    user: state.user,
    channel: state.channel,
    team: state.team,
    tasks: state.tasks,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardsExtension)
