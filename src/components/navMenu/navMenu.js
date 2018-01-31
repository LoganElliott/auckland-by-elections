import React from 'react'
import {iconImagesPath} from '../../conf/conf';

require('./navMenu.scss');

export default class NavMenu extends React.Component {
    constructor(context) {
        super(context);
    }

    render() {
        return(
            <div className="nav">
                <a>
                    <img className="nav__gz-logo" src={iconImagesPath + 'GZ-logo.png'}/>
                </a>
                <span className="nav__items">
                        <a href="http://aucklandelections.co.nz" className="nav__items-item">Home</a>
                        <a href="http://details.aucklandelections.co.nz/criteria" className="nav__items-item">Our Criteria</a>
                        <a href="http://details.aucklandelections.co.nz/about-us" className="nav__items-item">About Us</a>
                </span>
            </div>
        );
    }
}
