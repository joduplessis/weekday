import React from 'react'
import PropTypes from 'prop-types'

const MIN_HEIGHT = 25

export class TextareaComponent extends React.Component {
  constructor(props) {
    super(props)

    this.textareaRef = React.createRef()
  }

  componentDidMount() {
    if (this.textareaRef) {
      if (this.textareaRef.style) {
        const minHeight = this.textareaRef.scrollHeight < MIN_HEIGHT ? MIN_HEIGHT : this.textareaRef.scrollHeight
        this.textareaRef.style.height = '1px'
        this.textareaRef.style.height = minHeight + 'px'

        if (!!this.props.select) this.textareaRef.select()
      }
    }
  }

  render() {
    if (this.textareaRef) {
      if (this.textareaRef.style) {
        const minHeight = this.textareaRef.scrollHeight < MIN_HEIGHT ? MIN_HEIGHT : this.textareaRef.scrollHeight
        this.textareaRef.style.height = '1px'
        this.textareaRef.style.height = minHeight + 'px'
      }
    }

    return <textarea ref={ref => (this.textareaRef = ref)} {...this.props} />
  }
}
