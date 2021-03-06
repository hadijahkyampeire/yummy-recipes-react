import React, {Component} from 'react';
import TimeAgo from 'react-timeago';
import {Link} from 'react-router-dom';
import $ from 'jquery';

import SideBar from '../SideBar';
import PreLoader, {YummyNotifier, displayError} from '../Utilities';
import CategoryRequest from '../../helpers/Categories';

export const Category = (props) => {
    const {name, id, owner_details, created, edited} = props.category;

    return (
        <li>
            <div className="collapsible-header">{name}</div>
            <div className="collapsible-body white ">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                Category Name:
                            </td>
                            <td>
                                {name}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Owner:
                            </td>
                            <td>
                                {`${owner_details.firstname} ${owner_details.lastname}`}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Created:
                            </td>
                            <td>
                                <TimeAgo date={created+"+3"}/>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Last Edited:
                            </td>
                            <td>
                                <TimeAgo date={ edited+"+3" }/>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr />
                <div className="center-align">
                    <Link to={`edit-category/${id}`} className="btn orange btn-small"><i className="fa fa-edit"/>
                        Edit</Link>
                    <Link to={`delete-category/${id}`} onClick={(e)=>props.deleteCategory(e,id)} className="btn red btn-small"><i className="fa fa-remove"/>
                        Delete</Link>
                </div>
            </div>
        </li>
    )
}

export class CategoryList extends Component {
    state = {
        categories: [],
    }

    getUserCategories() {
        CategoryRequest
            .fetchUserCategories()
            .then(response => {
                this.setState({categories: response.data.recipe_cats,})
                this.props.onFetchCategories()
            })
            .catch(error => {
                if(error.response){
                    const { data, status } = error.response;
                    //send data and error to a higher order method to signal occurance of an error 
                    //and that no recipe is created yet
                    if(status === 404){
                        this.setState({ categories: []})
                    }
                    this.props.handleFetchError(data.errors[0])
                }else if (error.request){
                    window.Materialize.toast("Request Can't be made", 5000);
                }
            })
    }

    deleteCategory = (event, id)=>{
        event.preventDefault();
        CategoryRequest.deleteCategory(id)
        .then(response=>{
            //alert user that he has successfully deleted a recipe
            window.Materialize.toast(response.data.message, 5000);
            //update categories list
            this.getUserCategories();
        })
        .catch(error=>{
           displayError(error);
        })
    }

    componentWillMount() {
        this.getUserCategories();
    }

    componentDidMount() {
        $('.collapsible').collapsible();
    }

    render() {
        const {categories} = this.state;
        // create a list of categories
        const categoryItems = categories.map(category => {
            return (<Category category={category} key={category.id} deleteCategory={this.deleteCategory}/>)
        })

        return (
            <ul className="collapsible popout" data-collapsible="accordion">
                {categoryItems.reverse()}
            </ul>
        )
    }
}

class Categories extends Component {
    state={
        loadedCategories: false,
        error: false,
        errorMessage: '',
    }

    onFetchCategories = ()=>{
        this.setState({
            loadedCategories: true,
            error: false
        })
    }

    handleFetchError = (errorMessage)=>{
        // alert(errorMessage)
        this.setState({
            errorMessage,
            loadedCategories: false,
            error: true
        })
    }

    render() {
        let loader = null;
        const {loadedCategories, error, errorMessage} = this.state

        if(!loadedCategories && !error){
            loader = <PreLoader message="Fetching Categories........"/>
        }

        if(!loadedCategories && error){
            loader = <YummyNotifier message={errorMessage} />
        }

        return (
            <div className="row">
                <div className="col s4">
                    <SideBar />
                </div>
                <div className="col s8">
                    <div className="card orange-text center-align">
                        <div className="card-title">Categories</div>
                    </div>
                    {loader}
                    <CategoryList onFetchCategories={this.onFetchCategories} handleFetchError={this.handleFetchError}/>
                </div>
            </div>
        )
    }
}

export default Categories;
