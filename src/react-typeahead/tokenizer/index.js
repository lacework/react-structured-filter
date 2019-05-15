var React = require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var cx = require('classnames');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = createReactClass({
    propTypes: {
        options: PropTypes.array,
        customClasses: PropTypes.object,
        defaultSelected: PropTypes.array,
        defaultValue: PropTypes.string,
        placeholder: PropTypes.string,
        onTokenRemove: PropTypes.func,
        onTokenAdd: PropTypes.func,
        value: PropTypes.array
    },

    getInitialState: function() {
        return {
            //selected: this.props.defaultSelected,
            selected: this.getStateFromProps(this.props),
            category: "",
            operator: "",
            categoryType: "",
            errorMsg: null
        };
    },

    getStateFromProps( props ) {
        const value = props.value || props.defaultValue || [];
        return value.slice( 0 );
    },

    getDefaultProps: function() {
        return {
            options: [],
            defaultSelected: [],
            customClasses: {},
            defaultValue: "",
            placeholder: "",
            value: [],
            onTokenAdd: function() {},
            onTokenRemove: function() {}
        };
    },

    // TODO: Support initialized tokens
    //
    _renderTokens: function() {
        var tokenClasses = {}
        tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
        //var classList = React.addons.classSet(tokenClasses);
        var classList = cx(tokenClasses);
        var result = this.state.selected.map(function(selected) {
            let mykey = selected.category + selected.operator + selected.value;

            return (
                <Token key={mykey} className={classList}
                       data-onremove={ this._removeTokenForValue }>
                    { selected }
                </Token>

            )
        }, this);
        return result;
    },

    _getOptionsForTypeahead: function() {
        if (this.state.category=="") {
            var categories=[];
            for (var i = 0; i < this.props.options.length; i++) {
                categories.push(this.props.options[i].category);
            }
            return categories;
        } else if (this.state.operator=="") {
            let categoryType = this._getCategoryType();
            if (categoryType == "String" || categoryType == "ipaddr" || categoryType == "Number") { return ["matches", "includes", "excludes", "starts with", "ends with", "does not match"]; }
            else if(categoryType == "keyValue") {return ["matches", "does not match"];}
            else {console.log("WARNING: Unknown category type in tokenizer");};

        } else {
            var options = this._getCategoryOptions();
            if (options == null) return []
            else return options;
            //else return options();
        }

        return this.props.options;
    },

    _getHeader: function() {
        if (this.state.category=="") {
            //return "Category";
            return "Filters";
        } else if (this.state.operator=="") {
            return "Operator";
        } else {
            return "Value";
        }

        return this.props.options;
    },

    _getCategoryType: function() {
        for (var i = 0; i < this.props.options.length; i++) {
            if (this.props.options[i].category == this.state.category) {
                let categoryType = this.props.options[i].type;
                return categoryType;
            }
        }
    },

    _getCategoryOptions: function() {
        for (var i = 0; i < this.props.options.length; i++) {
            if (this.props.options[i].category == this.state.category) {
                return this.props.options[i].options;
            }
        }
    },


    _onKeyDown: function(event) {
        // We only care about intercepting backspaces
        if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
            return;
        }

        // Remove token ONLY when bksp pressed at beginning of line
        // without a selection
        //var entry = this.refs.typeahead.inputRef().getDOMNode();
        var entry = this._typeahead.getInstance().inputRef();
        if (entry.selectionStart == entry.selectionEnd &&
            entry.selectionStart == 0)
        {
            if (this.state.operator != "") {
                this.setState({operator: ""});
            } else if (this.state.category != "") {
                this.setState({category: ""});
            } else {
                // No tokens
                if (!this.state.selected.length) {
                    return;
                }
                this._removeTokenForValue(
                    this.state.selected[this.state.selected.length - 1]
                );
            }
            event.preventDefault();
        }
    },

    _validateEntry(type, opr, value){
        let response = {};

        if(type !== 'keyValue') {
            if(value.length > 65) {
                response.message = 'Input too long';
                response.status = false;
                return response;
            }
        }

        switch(type) {
            case 'Number':
                if (/^([0-9]+)$/.test(value)) {
                    response.status = true;
                } else {
                    response.message = 'Only numbers permitted';
                    response.status = false;
                }
                break;

            case 'String':
                response.status = true;
                break;

            case 'keyValue':
                response.status = true;
                break;

            case 'ipaddr':
                const testValue = value.split('.');
                let result = true;
                testValue.forEach(t => {
                    if (!(testValue.length <= 4 && t.length <= 3 && (/^[\d\*]{1,3}$/.test(t) || (/^[\d]{1,3}$/.test(t) && t <= 255)))) result = false;
                });
                if (value.includes('*') && result) {
                    response.status = true;
                } else if (['includes', 'excludes', 'starts with', 'ends with',].includes(opr) && result) {
                    response.status = true;
                } else if (['matches', 'does not match'].includes(opr) &&
                    /^([2][5][0-5]|[2][0-4][0-9]|[1][0-9][0-9]|[0-9]{1,2})(\.([2][5][0-5]|[2][0-4][0-9]|[1][0-9][0-9]|[0-9]{1,2})){3}$/.test(
                        value
                    )
                ) {
                    response.status = true;
                } else {
                    response.message = 'Invalid IPv4 address format';
                    response.status = false;
                }
                break;
        }
        return response;
    },

    _removeTokenForValue: function(value) {
        var index = this.state.selected.indexOf(value);
        if (index == -1) {
            return;
        }

        this.state.selected.splice(index, 1);
        this.setState({selected: this.state.selected});
        this.props.onTokenRemove(this.state.selected);

        return;
    },

    _addTokenForValue: function(value) {
        if (this.state.category == "") {
            this.setState({category: value});
            //this.refs.typeahead.setEntryText("");
            this._typeahead.getInstance().setEntryText("");
            return;
        }

        if (this.state.operator == "") {
            let categoryType = this._getCategoryType();
            this.setState({operator: value, categoryType: categoryType});
            //this.refs.typeahead.setEntryText("");
            this._typeahead.getInstance().setEntryText("");
            return;
        }

        let isValidEntry = this._validateEntry(this.state.categoryType, this.state.operator, value);
        if(isValidEntry.status == true) {
            value = {"category":this.state.category,"operator":this.state.operator,"value":value};

            this.state.selected.push(value);
            this.setState({selected: this.state.selected, errorMsg: null});
            //this.refs.typeahead.setEntryText("");
            this._typeahead.getInstance().setEntryText("");
            this.props.onTokenAdd(this.state.selected);
            this.setState({category: "", operator: ""});
        } else {
            this.setState({errorMsg: isValidEntry.message});
            setTimeout(
                function(self) { self.setState({errorMsg: undefined}); },
                3000,
                this
            );
        }
        return;
    },

    /***
     * Returns the data type the input should use ("date" or "text")
     */
    _getInputType: function() {
        if (this.state.category != "" && this.state.operator != "") {
            return this._getCategoryType();
        } else {
            return "text";
        }
    },

    render: function() {
        var classes = {}
        classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
        //var classList = React.addons.classSet(classes);
        var classList = cx(classes);
        var showErrorMsg = null;
        if(this.state.errorMsg) {
            showErrorMsg = (<span className="tooltip bottom left">{this.state.errorMsg}</span>);

        }
        return (
            <div className="filter-tokenizer">
                {/*<span className="input-group-addon">
                 <i className="fa fa-search"></i>
                 </span>*/}
              <div className="token-collection">
                <div className="filter-input-group">
                  <div className="filter-category">{ this.state.category }</div>
                  <div className="filter-operator">{ this.state.operator }</div>
                  <Typeahead ref={(typeahead) => this._typeahead = typeahead}
                             className={classList}
                             placeholder={this.props.placeholder}
                             customClasses={this.props.customClasses}
                             options={this._getOptionsForTypeahead()}
                             header={this._getHeader()}
                             datatype={this._getInputType()}
                             defaultValue={this.props.defaultValue}
                             onOptionSelected={this._addTokenForValue}
                             onKeyDown={this._onKeyDown} />
                    {showErrorMsg}
                </div>
                  <div className="tokens">
                      { this._renderTokens() }
                  </div>
              </div>
            </div>
        )
    }
});

module.exports = TypeaheadTokenizer;
