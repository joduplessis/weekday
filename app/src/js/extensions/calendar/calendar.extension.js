import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { useSelector, useDispatch, ReactReduxContext } from 'react-redux'
import './calendar.extension.css'
import styled from 'styled-components'
import { IconComponent } from '../../components/icon.component'
import { getQueryStringValue, logger, getMentions, getHighestTaskOrder } from '../../helpers/util'
import GraphqlService from '../../services/graphql.service'
import PropTypes from 'prop-types'
import arrayMove from 'array-move'
import StorageService from '../../services/storage.service'
import { DEVICE } from '../../environment'
import { MIME_TYPES } from '../../constants'
import { classNames, isTaskHeading } from '../../helpers/util'
import dayjs from 'dayjs'
import MonthDayComponent from './components/month-day/month-day.component'
import { hydrateTasks, createTasks } from '../../actions'

class CalendarExtension extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      notification: null,
      loading: false,
      weeks: [],
      month: '',
      date: new Date(),
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }

    this.forward = this.forward.bind(this)
    this.back = this.back.bind(this)
    this.today = this.today.bind(this)
    this.createDays = this.createDays.bind(this)
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleCreateTask = this.handleCreateTask.bind(this)
  }

  async handleCreateTask(title, date) {
    if (title.trim() == '') return

    try {
      this.setState({
        loading: true,
        error: null,
      })

      // To accommodate for "" as ID
      const channelId = !!this.props.channel.id ? this.props.channel.id : null
      const teamId = this.props.team.id
      const userId = this.props.user.id
      const dueDate = date.toDate()
      const order = getHighestTaskOrder(this.props.tasks)
      const { data } = await GraphqlService.getInstance().createTask({
        channel: channelId,
        title,
        order,
        dueDate,
        user: userId,
        team: teamId,
      })
      const task = data.createTask

      // Stop the loading
      this.setState({ loading: false })

      // Add it ot he store
      this.props.createTasks(channelId, task)
    } catch (e) {
      console.log(e)
      logger(e)
      this.setState({
        error: 'Error fetching tasks',
        loading: false,
      })
    }
  }

  async fetchTasks() {
    try {
      const { channelId, teamId } = this.props.match.params
      let searchCriteria = {}

      if (channelId) searchCriteria['channel'] = channelId
      if (teamId) searchCriteria['team'] = teamId

      const { data } = await GraphqlService.getInstance().tasks(searchCriteria)
      this.props.hydrateTasks(data.tasks || [])
    } catch (e) {
      logger(e)
    }
  }

  createDays(date) {
    const weeks = []
    const month = dayjs(date)
      .startOf('month')
      .format('MMMM')
    let monthStartDay
    let firstDay = dayjs(date).startOf('month')
    let lastDay = dayjs(date).endOf('month')
    let totalWeeks = 6

    // Find which date we need to start on
    while (!monthStartDay) {
      const weekday = firstDay.format('dddd').toUpperCase()
      const targetWeekday = this.state.weekdays[0].toUpperCase()
      if (weekday == targetWeekday) monthStartDay = firstDay
      firstDay = firstDay.subtract(1, 'days')
    }

    for (let week = 0; week < totalWeeks; week++) {
      const days = []
      const startDay = monthStartDay.add(week, 'weeks')
      const endDay = startDay.endOf('week').add(1, 'days')

      for (let day = startDay; day.isBefore(endDay); day = day.add(1, 'days')) {
        days.push(day)
      }

      // Ignore weeks that are totally in the next month
      if (startDay.isBefore(lastDay)) weeks.push(days)
    }

    this.setState({
      weeks,
      month,
    })
  }

  today() {
    const date = new Date()
    this.createDays(date)
    this.setState({ date })
  }

  forward() {
    const date = dayjs(this.state.date)
      .add(1, 'months')
      .toDate()
    this.setState({ date })
    this.createDays(date)
  }

  back() {
    const date = dayjs(this.state.date)
      .subtract(1, 'months')
      .toDate()
    this.setState({ date })
    this.createDays(date)
  }

  componentDidMount() {
    this.today()
    this.fetchTasks()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.channelId != prevProps.match.params.channelId) {
      this.fetchTasks()
    }
  }

  render() {
    return (
      <div className="calendar-extension">
        <div className="toolbar row">
          <div className="date-heading">{this.state.month}</div>
          <div className="flexer" />
          <div className="icon-button" onClick={this.back}>
            <IconComponent icon="chevron-left" size={16} color="#798898" />
          </div>
          <div className="text-button" onClick={this.today}>
            Today
          </div>
          <div className="icon-button" onClick={this.forward}>
            <IconComponent icon="chevron-right" size={16} color="#798898" />
          </div>
        </div>
        <div className="weekdays">
          {this.state.weekdays.map((weekday, index) => {
            return (
              <div className="weekday" key={index}>
                {weekday}
              </div>
            )
          })}
        </div>
        <div className="container">
          {this.state.weeks.map((week, index) => {
            return (
              <div key={index} className="week">
                {week.map((day, index) => {
                  return (
                    <MonthDayComponent
                      day={day}
                      key={index}
                      index={index}
                      handleAccept={name => this.handleCreateTask(name, day)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

CalendarExtension.propTypes = {
  user: PropTypes.any,
  channel: PropTypes.any,
  team: PropTypes.any,
  tasks: PropTypes.any,
  hydrateTasks: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateTasks: tasks => hydrateTasks(tasks),
  createTasks: (channelId, task) => createTasks(channelId, task),
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
)(CalendarExtension)
