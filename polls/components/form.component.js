import React, { useState, useEffect } from 'react'
import { Progress, Button, Input, Textarea, Select } from '@weekday/elements'
import moment from 'moment'
import { Trash } from 'react-feather'

export default function FormComponent(props) {
  const today = moment()
  const months = [
    { option: 'January', value: 1 },
    { option: 'February', value: 2 },
    { option: 'March', value: 3 },
    { option: 'April', value: 4 },
    { option: 'May', value: 5 },
    { option: 'June', value: 6 },
    { option: 'July', value: 7 },
    { option: 'August', value: 8 },
    { option: 'September', value: 9 },
    { option: 'October', value: 10 },
    { option: 'November', value: 11 },
    { option: 'December', value: 12 },
  ]
  const years = [
    { option: today.year(), value: today.year() },
    { option: today.year() + 1, value: today.year() + 1 },
  ]
  const [days, setDays] = useState(null)
  const [id, setId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState([{id: 0, text: ''}])
  const [day, setDay] = useState(0)
  const [month, setMonth] = useState(today.format('M') - 1)
  const [year, setYear] = useState(0)

  const addOption = () => setOptions([...options, {
    id: options.length + 1,
    text: '',
  }])

  const removeOption = (index) => {
    let mutableOptions = Object.assign([], options)
    mutableOptions.splice(index, 1)
    setOptions(mutableOptions)
  }

  const updateOption = (text, id) => {
    setOptions(options.map(option => {
      if (id != option.id) return option

      return { id: option.id, text }
    }))
  }

  const save = () => {
    const expiry = moment(`${days[day].value}/${months[month].value}/${years[year].value}`, 'DD/MM/YYYY').format("YYYY-MM-DD HH:mm:ss")

    // If we are updating
    if (id) props.onSubmit(id, title, description, options, expiry)

    // If we are creating
    if (!id) props.onSubmit(title, description, options, expiry)
  }

  const updateMonthDays = (day, month, year) => {
    const date = moment(`${day}/${month}/${year}`, 'DD/MM/YYYY')
    const daysArray = []

    for (let day=1; day <= date.daysInMonth(); day++) {
      daysArray.push({ option: day, value: day })
    }

    setDay(day - 1)
    setDays(daysArray)
  }

  useEffect(() => {
    const date = props.expiry ? moment(props.expiry) : moment()
    const yearIndex = years.map(y => y.value).indexOf(parseInt(date.format('YYYY')))

    // Always rnu this
    updateMonthDays(date.format('DD'), date.format('MM'), date.format('YYYY'))

    // Update these values if we're updating
    if (props.id) {
      setId(props.id)
      setTitle(props.title)
      setDescription(props.description)
      setOptions(props.options)
      setDay(date.format('D') - 1)
      setMonth(date.format('M') - 1)
      setYear(yearIndex == -1 ? 0 : yearIndex)
    }
  }, [])

  return (
    <React.Fragment>
      <style jsx>{`
        .poll-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          align-content: center;
          justify-content: center;
        }

        .poll-inner {
          flex-direction: column;
          display: flex;
          align-items: center;
          align-content: center;
          justify-content: center;
        }

        .progress-container {
          margin-bottom: 5px;
          width: 100%;
        }
      `}</style>

      <div className="poll-container">
        <div className="poll-inner">
          <Input
            value={title}
            inputSize="large"
            placeholder="Poll title"
            onChange={e => setTitle(e.target.value)}
          />

          <Textarea
            value={description}
            textareaSize="large"
            placeholder="Poll description"
            rows={3}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="h5 color-d0 text-left w-100 mb-10 mt-20">Options</div>

          {options.map((option, index) => {
            return (
              <div className="row w-100 mb-5" key={index}>
                <Input
                  value={option.text}
                  placeholder="Option text"
                  inputSize="large"
                  onChange={e => updateOption(e.target.value, option.id)}
                />
                <Trash
                  color="#ACB5BD"
                  size="20"
                  thickness="1.5"
                  className="ml-20 button"
                  onClick={e => removeOption(index)}
                />
              </div>
            )
          })}

          <div className="h5 color-d0 text-left w-100 mb-10 mt-20">Expiry</div>

          {days &&
            <div className="row w-100">
              <div className="flexer column pr-10">
                <div className="small color-d0 text-left bold mb-5">Day</div>
                <Select
                  selected={day}
                  size="large"
                  onSelect={(index) => setDay(index)}
                  options={days}
                />
              </div>

              <div className="flexer column p-10">
                <div className="small color-d0 text-left bold mb-5">Month</div>
                <Select
                  selected={month}
                  size="large"
                  onSelect={(index) => {
                    setMonth(index)
                    updateMonthDays(1, months[index].value, years[year].value)
                  }}
                  options={months}
                />
              </div>

              <div className="flexer column pl-10">
                <div className="small color-d0 text-left bold mb-5">Year</div>
                <Select
                  selected={year}
                  size="large"
                  onSelect={(index) => {
                    setYear(index)
                    updateMonthDays(1, months[month].value, years[index].value)
                  }}
                  options={years}
                />
              </div>
            </div>
          }

          <div className="row w-100 mt-20">
            <Button
              size="small"
              theme="blue-border"
              text="Add a new option"
              onClick={addOption}
            />
            <div className="flexer" />
            <Button
              size="small"
              theme="blue"
              text={!props.id ? "Create poll" : "Update poll"}
              onClick={save}
            />
          </div>

        </div>
      </div>
    </React.Fragment>
  )
}
