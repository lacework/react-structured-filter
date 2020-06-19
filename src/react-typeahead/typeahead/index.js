//var React = window.React || require('react/addons');
var React = require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var DatePicker = require('react-datetime');
var moment = require('moment');
var cx = require('classnames');
var onClickOutside = require('react-onclickoutside');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var _ = require('underscore');
/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */

var Typeahead = onClickOutside(createReactClass({
    propTypes: {
        customClasses: PropTypes.object,
        customErrors: PropTypes.object,
        errorMsg: PropTypes.string,
        maxVisible: PropTypes.number,
        options: PropTypes.array,
        header: PropTypes.string,
        datatype: PropTypes.string,
        defaultValue: PropTypes.string,
        placeholder: PropTypes.string,
        onOptionSelected: PropTypes.func,
        onKeyDown: PropTypes.func
    },

    // mixins: [
    //     require('react-onclickoutside')
    // ],

    getDefaultProps: function() {
        return {
            options: [],
            header: "Category",
            datatype: "text",
            customClasses: {},
            customErrors: {},
            defaultValue: "",
            placeholder: "",
            onKeyDown: function(event) { return },
            onOptionSelected: function(option) { }
        };
    },

    getInitialState: function() {
        return {
            // The set of all options... Does this need to be state?  I guess for lazy load...
            options: this.props.options,
            header: this.props.header,
            datatype: this.props.datatype,

            focused: false,

            // The currently visible set of options
            visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

            // This should be called something else, "entryValue"
            entryValue: this.props.defaultValue,

            // A valid typeahead value
            selection: null
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (!_.isEqual(nextProps.options, this.props.options) ||
            !_.isEqual(nextProps.datatype, this.props.datatype)) {
            this.setState({options: nextProps.options,
                header: nextProps.header,
                datatype: nextProps.datatype,
                visible: nextProps.options.length === 0 ? false : nextProps.options});
        }
    },

    getOptionsForValue: function(value, options) {
        var result = fuzzy.filter(value, options).map(function(res) {
            return res.string;
        });

        if (this.props.maxVisible) {
            result = result.slice(0, this.props.maxVisible);
        }

        if(result && result.length == 0 && options && options.length !== 0) {
            this.props.setErrorMsg(
                this.props.customErrors.noOptionFound || 'Please select or enter valid text for filtering',
                true
            );
            return false;
        }

        this.props.setErrorMsg(false);
        return result;
    },

    setEntryText: function(value) {
        if (this.refs.entry != null) {
            //this.refs.entry.getDOMNode().value = value;
            this.refs['entry'].value = value;
        }
        this._onTextEntryUpdated();
    },

    _renderIncrementalSearchResults: function() {
        if (!this.state.focused) {
            return "";
        }

        // Something was just selected
        if (this.state.selection) {
            return "";
        }

        // There are no typeahead / autocomplete suggestions
        if (this.state.visible === false) {
            return "";
        }

        return (
            <TypeaheadSelector
                ref="sel" options={ this.state.visible } header={this.state.header}
                onOptionSelected={ this._onOptionSelected }
                customClasses={this.props.customClasses}
                errorMsg={this.props.errorMsg}
            />
        );
    },

    _onOptionSelected: function(option) {
        if (!option) {
            return;
        }
        //var nEntry = this.refs.entry.getDOMNode();
        var nEntry = this.refs['entry'];
        nEntry.focus();
        nEntry.value = option;
        this.setState({visible: this.getOptionsForValue(option, this.state.options),
            selection: option,
            entryValue: option});

        this.props.onOptionSelected(option);
        if(this.refs.sel){
            this.refs.sel.state.selection = "";
        }
    },

    _onTextEntryUpdated: function() {
        var value = "";
        if (this.refs.entry != null) {
            //value = this.refs.entry.getDOMNode().value;
            value = this.refs['entry'].value;
        }
        var visible = this.getOptionsForValue(value, this.state.options);
        var empty = !visible || visible.length === 0;
        this.setState({visible: this.state.options.length === 0 && empty ? false : (visible || []),
            selection: null,
            entryValue: value});
    },

    _onClick: function(){
        this.setState({visible: this.getOptionsForValue(this.props.defaultValue, this.props.options)});
    },

    _onEnter: function(event) {
        if (!this.refs.sel.state.selection) {
            return this.props.onKeyDown(event);
        }

        this._onOptionSelected(this.refs.sel.state.selection);
    },

    _onEscape: function() {
        this.refs.sel.setSelectionIndex(null);
        this.refs['entry'].blur();
        this.setState({visible:'', focused: false});
    },

    _onTab: function(event) {
        var option = this.refs.sel.state.selection ?
            this.refs.sel.state.selection : this.state.visible[0];
        this._onOptionSelected(option)
    },

    eventMap: function(event) {
        var events = {};

        events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
        events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
        events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
        events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
        events[KeyEvent.DOM_VK_TAB] = this._onTab;

        return events;
    },

    _onKeyDown: function(event) {
        // If Enter pressed
        if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ENTER) {
            // If no options were provided so we can match on anything
            if (this.props.options.length===0) {
                this._onOptionSelected(this.state.entryValue);
            }

            // If what has been typed in is an exact match of one of the options
            if (this.props.options.indexOf(this.state.entryValue) > -1) {
                this._onOptionSelected(this.state.entryValue);
            }
        }

        // If there are no visible elements, don't perform selector navigation.
        // Just pass this up to the upstream onKeydown handler
        if (!this.refs.sel) {
            return this.props.onKeyDown(event);
        }

        var handler = this.eventMap()[event.keyCode];

        if (handler) {
            handler(event);
        } else {
            return this.props.onKeyDown(event);
        }
        // Don't propagate the keystroke back to the DOM/browser
        event.preventDefault();
    },

    _onFocus: function(event) {
        this.setState({focused: true});
    },

    handleClickOutside: function(event) {
        this.setState({focused:false});
    },

    isDescendant: function(parent, child) {
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },

    _handleDateChange: function(date) {
        this.props.onOptionSelected(date.format("YYYY-MM-DD"));
    },

    _showDatePicker: function() {
        if (this.state.datatype == "date") {
            return true;
        }
        return false;
    },

    inputRef: function() {
        if (this._showDatePicker()) {
            return this.refs.datepicker.refs.dateinput.refs.entry;
        } else {
            return this.refs.entry;
        }
    },

    render: function() {
        var inputClasses = {}
        inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
        //var inputClassList = React.addons.classSet(inputClasses)
        var inputClassList = cx(inputClasses)

        var classes = {
            typeahead: true
        }
        classes[this.props.className] = !!this.props.className;
        //var classList = React.addons.classSet(classes);
        var classList = cx(classes);

        if (this._showDatePicker()) {
            return (
                <span ref="input" className={classList} onFocus={this._onFocus}>
          <DatePicker ref="datepicker" dateFormat={"YYYY-MM-DD"} selected={moment()} onChange={this._handleDateChange} onKeyDown={this._onKeyDown}/>
        </span>
            );
        }

        return (
            <span ref="input" className={classList} onFocus={this._onFocus}>
        <input ref="entry" type="text"
               placeholder={this.props.placeholder}
               className={inputClassList} defaultValue={this.state.entryValue}
               onChange={this._onTextEntryUpdated} onKeyDown={this._onKeyDown}
               onClick={this._onClick}
        />
                { this._renderIncrementalSearchResults() }
      </span>
        );
    }
}));

module.exports = Typeahead;
