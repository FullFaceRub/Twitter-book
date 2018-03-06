import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

export default class Home extends Component {
    // video tutorial modal
    // featured books
    // influential people
    // inspirational people
    // categories filter
    // add new book
    // search users to save tweets ???
    constructor() {
        super();
        this.state = {
            searchInput: '',
            fearturedBooks: [],
            tweets: [],
            searchedTweets: [],
            yourTweets: true,
        }
    }
    async componentDidMount() {
        await axios.get('/api/get-featured-books').then(res => {
            this.setState({
                fearturedBooks: res.data
            })
        })
        await axios.get('/api/twitter').then(res => {
            this.setState({
                tweets: res.data.data
            })
        })
    }
    updateTweetSearch(val) {
        this.setState({
            searchInput: val
        })
    }
    handleSearch() {
        var screenName = {
            screenName: this.state.searchInput
        }
        axios.post("/api/searchedUser", screenName).then(res => {
            this.setState({
                searchedTweets: res.data.data,
                yourTweets: false
            })
        })
    }
    changeTweets() {
        this.setState({
            yourTweets: true
        })
    }
    handleAddTweet(i) {
        let tweet = i
        let tweetImg = i.user.profile_image_url.replace("normal", "400x400")
        var text = tweet.text;
        var text1 = text.replace(/https.*$/g, '')
        var text2 = text1.replace(/^(.*?): /g, '')
        var tweetBody = {
            img: tweetImg,
            userName: tweet.user.name,
            userScreenName: tweet.user.screen_name,
            text: text2,
            tweet_date: tweet.created_at,
            mediaOne: tweet.extended_entities ? tweet.extended_entities.media[0] ? tweet.extended_entities.media[0].media_url : null : null,
            mediaTwo: tweet.extended_entities ? tweet.extended_entities.media[1] ? tweet.extended_entities.media[1].media_url : null : null,
            mediaThree: tweet.extended_entities ? tweet.extended_entities.media[2] ? tweet.extended_entities.media[2].media_url : null : null,
            mediaFour: tweet.extended_entities ? tweet.extended_entities.media[3] ? tweet.extended_entities.media[3].media_url : null : null,
        }
        axios.post('/api/updatetweets', tweetBody).then(res => {
        })
    }
    render() {
        let featuredBooks = this.state.fearturedBooks.map((e, i) => {
            return (
                <div key={i}>
                    <div>{e.bookname}</div>
                </div>
            )
        })
        let yourTweets = this.state.tweets.map((e, i) => {
            var text = e.text;
            var text1 = text.replace(/https.*$/g, '')
            var text2 = text1.replace(/^(.*?): /g, '')
            return (
                <div key={i} className='tweets'>
                    <div className="tweetHead">
                        <img src={e.user.profile_image_url} alt="" className='tweetUserImg' />
                        <div className="tweetTextContainer">
                            <div className="usernameAndScreenname">
                                <h1>{e.user.name}</h1>
                                <h2>@{e.user.screen_name}</h2>
                            </div>
                            <p className='tweetText'>{text2}</p>
                        </div>
                    </div>
                    <div className="media">
                        {e.extended_entities ? e.extended_entities.media[0] ? <img src={e.extended_entities.media[0].media_url} alt="" className="tweetImg" /> : null : null}
                        {e.extended_entities ? e.extended_entities.media[1] ? <img src={e.extended_entities.media[1].media_url} alt="" className="tweetImg" /> : null : null}
                    </div>
                    <div className="media">
                        {e.extended_entities ? e.extended_entities.media[2] ? <img src={e.extended_entities.media[2].media_url} alt="" className="tweetImg" /> : null : null}
                        {e.extended_entities ? e.extended_entities.media[3] ? <img src={e.extended_entities.media[3].media_url} alt="" className="tweetImg" /> : null : null}
                    </div>
                    <button onClick={() => this.handleAddTweet(i)}>Add Tweet</button>
                    <br />
                </div>
            )
        })
        let searchedTweets = this.state.searchedTweets.map((e, i) => {
            var text = e.text;
            var text1 = text.replace(/https.*$/g, '')
            var text2 = text1.replace(/^(.*?): /g, '')
            return (
                <div key={i} className='tweets'>
                    <div className="tweetHead">
                        <img src={e.user.profile_image_url} alt="" className='tweetUserImg' />
                        <div className="tweetTextContainer">
                            <div className="usernameAndScreenname">
                                <h1>{e.user.name}</h1>
                                <h2>@{e.user.screen_name}</h2>
                            </div>
                            <p className='tweetText'>{text2}</p>
                        </div>
                    </div>
                    <div className="media">
                        {e.extended_entities ? e.extended_entities.media[0] ? <img src={e.extended_entities.media[0].media_url} alt="" className="tweetImg" /> : null : null}
                        {e.extended_entities ? e.extended_entities.media[1] ? <img src={e.extended_entities.media[1].media_url} alt="" className="tweetImg" /> : null : null}
                    </div>
                    <div className="media">
                        {e.extended_entities ? e.extended_entities.media[2] ? <img src={e.extended_entities.media[2].media_url} alt="" className="tweetImg" /> : null : null}
                        {e.extended_entities ? e.extended_entities.media[3] ? <img src={e.extended_entities.media[3].media_url} alt="" className="tweetImg" /> : null : null}
                    </div>
                    <button onClick={() => this.handleAddTweet(i)}>Add Tweet</button>
                    <br />
                </div>
            )
        })
        return (
            <div className='homeContainer'>
                <div className="searchContainer">
                    <div className="tweetSearch">
                        <h1>Search Tweets</h1>
                        <input type="text" onChange={e => this.updateTweetSearch(e.target.value)} />
                        <button onClick={() => this.handleSearch()}>click this</button>
                        <button onClick={() => this.changeTweets()}>Your Tweets</button>
                        {this.state.yourTweets ? yourTweets : searchedTweets}
                    </div>
                </div>
                <div className="homeRight">
                    <div className="featuredContainer">
                        <div className="featuredbooks">
                            {featuredBooks}
                        </div>
                    </div>
                    <div className="homeFiltersContainer">
                    </div>
                </div>
                <Link to="/newbook"><div className="newBookButton">
                    +
                    </div></Link>
            </div>
        )
    }
}