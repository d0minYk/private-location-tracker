import React, { Component, createRef } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AES from "crypto-js/aes";
import EncUTF8 from "crypto-js/enc-utf8";
import './Dashboard.css';
import Map from './Map';
import Utilities from './Utilities';

import LogoutIcon from '-!svg-react-loader!./icons/log-out.svg';
import PathIcon from '-!svg-react-loader!./icons/analytics.svg';
import PointIcon from '-!svg-react-loader!./icons/apps.svg';
import DownloadIcon from '-!svg-react-loader!./icons/download.svg';
import DownloadFromAppStore from './icons/appstore.png';

const bip39 = require('bip39');
const DropboxSDK = require('dropbox').Dropbox;
const ENCRYPTION_VALIDATOR_MESSAGE = "Check out https://www.facebook.com/AnimalSanctuary.TH/"

let encryptionKey = null;
let retrievedEncryptedValidator = null;

class Dashboard extends Component {

    constructor(props) {
        super(props)
        this.mapRef = createRef();
        this.groupRef = createRef();
        this.selectedLocationRef = createRef();
        this.state = {
            dropboxAuthCode: "",
            encryptionKey: "",
            loadingStatus: null,
            loggedIn: false,

            selectedDay: null,
            selectedLocation: null,
            days: [],
            day: null,

            mode: "path",
            loading: true
        }
    }

    fitBounds() {
        setTimeout(function() {
            if (this.state.day && this.state.day.length !== 0) {
                const group = this.groupRef.current.leafletElement;
                const map = this.mapRef.current.leafletElement;
                 let bounds = group.getBounds();
                 map.fitBounds(bounds);
            }
        }.bind(this), 500)
    }

    async loadDay(day) {

        this.setState({
            selectedDay: day,
            loadingStatus: "Loading " + day.replace(".txt", "") + " (0%)"
        })

        if (day.indexOf(".txt") !== -1) {

            let content = await (new Promise(function(resolve, reject) {
                window.dropbox
                    .filesDownload({path: '/' + day})
                    .then(async function(data) {
                        let fr = new FileReader();
                        fr.onload = async function() {
                            try {
                                let decrypted = AES.decrypt(this.result, encryptionKey).toString(EncUTF8)
                                resolve(JSON.parse(decrypted));
                            } catch (e) { reject(e); }
                        };
                        fr.readAsText(data.fileBlob);
                    }).catch(function(error) { reject(error) });
            }))

            for (let j = 0; j < content.length; j++) {
                if (!content[j].id) {
                    content[j].id = Math.round((new Date(content[j].date)).getTime());
                }
                content[j].longitude = parseFloat(content[j].lng);
                content[j].latitude = parseFloat(content[j].lat);
                content[j].bearing = parseFloat(content[j].bearing);
                content[j].heading = parseFloat(content[j].heading);
                content[j].altitude = parseFloat(content[j].altitude);
                content[j].speed = parseFloat(content[j].speed);
            }

            this.setState({ day: content.sort((a, b) => { return (a.id > b.id) }), loadingStatus: null }, function() {
                this.setState({ mode: (this.state.mode === "path") ? "point" : "path" }, function() {
                    setTimeout(function() {
                        this.setState({ mode: (this.state.mode === "path") ? "point" : "path" })
                    }.bind(this), 200);
                })
            })

        } else {

            let dayFiles = await window.dropbox.filesListFolder({path: '/' + day, limit: 2000});
            let allDayFiles = dayFiles.entries;

            while (dayFiles.has_more) {
                dayFiles = await window.dropbox.filesListFolderContinue({cursor: dayFiles.cursor});
                allDayFiles = allDayFiles.concat(dayFiles.entries)
            }

            allDayFiles = allDayFiles.map(item => {
                return item.name
            })

            allDayFiles = allDayFiles.sort().reverse();

            let contents = []
            // let pending = 0;

            await (new Promise(async function(resolve, reject) {

                for (let j = 0; j < allDayFiles.length; j++) {

                    console.log("Requesting");

                    new Promise(function(resolve, reject) {

                        let fileSub = allDayFiles[j];
                        let fileSubId = fileSub.replace(".txt", "")

                        window.dropbox
                            .filesDownload({path: '/' + day + "/" + fileSub})
                            .then(async function(data) {
                                let fr = new FileReader();
                                fr.onload = async function() {
                                    try {
                                        let decrypted = AES.decrypt(this.result, encryptionKey).toString(EncUTF8)
                                        resolve({
                                            content: JSON.parse(decrypted),
                                            fileSub: fileSub,
                                            fileSubId: fileSubId,
                                        });
                                    } catch (e) { reject(e); }
                                };
                                fr.readAsText(data.fileBlob);
                            }).catch(function(error) { reject(error) });

                    }).then(function(data) {

                        let content = data.content;

                        content.id = data.fileSubId;
                        content.longitude = parseFloat(content.lng);
                        content.latitude = parseFloat(content.lat);
                        content.bearing = parseFloat(content.bearing);
                        content.heading = parseFloat(content.heading);
                        content.altitude = parseFloat(content.altitude);
                        content.speed = parseFloat(content.speed);
                        contents.push(content);

                        this.setState({
                            loadingStatus: "Loading " + day.replace(".txt", "") + " (" + (Math.round(contents.length/allDayFiles.length*100)) + "%)"
                        })

                        if (contents.length === allDayFiles.length) {
                            resolve();
                        }

                    }.bind(this))

                    await (new Promise(function(resolve, reject) {
                        setTimeout(function() {
                            resolve()
                        }.bind(this), 200);
                    }))

                }

            }.bind(this))).catch(function(err) {
                console.log("FAILED", err);
                this.setState({
                    loadingStatus: null
                });
                alert("Failed to get some locations, please try again");
            })

            console.log("YUP< GOT IT ALL", contents)

            this.setState({ day: contents.sort((a, b) => { return (a.id > b.id) }), loadingStatus: null }, function() {
                this.setState({ mode: (this.state.mode === "path") ? "point" : "path" }, function() {
                    setTimeout(function() {
                        this.setState({ mode: (this.state.mode === "path") ? "point" : "path" })
                    }.bind(this), 200);
                })
            })

        }

        this.fitBounds();

    }

    async loadDays() {

        this.setState({ loadingStatus: "Loading days" })

        let newFiles = await window.dropbox.filesListFolder({path: '', limit: 2000});
        let allFiles = newFiles.entries;

        while (newFiles.has_more) {
            newFiles = await window.dropbox.filesListFolderContinue({cursor: newFiles.cursor});
            allFiles = allFiles.concat(newFiles.entries)
        }

        allFiles = allFiles.map(item => {
            return item.name
        })

        allFiles = allFiles.sort().reverse();

        for (let i = 0; i < allFiles.length; i++) {

            let file = allFiles[i]

            if (file === "DO-NOT-DELETE-encryption-validator.txt") {
                allFiles.splice(i, 1);
                i--;
                continue;
            }

            if (file.indexOf(".txt") !== -1) {
                let folderName = file.replace(".txt", "");
                allFiles.splice(allFiles.indexOf(folderName), 1)
                continue;
            }

        }

        // allFiles.reverse();

        this.setState({
            days: allFiles,
            loading: false,
            loadingStatus: null,
        })

    }

    componentDidMount() {

    }

    downloadDay() {

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.day)));
        element.setAttribute('download', this.state.selectedDay.replace(".txt", "") + ".json");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    }

    onInputChange = (e) => {
        let modifiedField = e.target.id;
        let modifiedFieldValue = e.target.value;
        let state = {...this.state};
        state[modifiedField] = modifiedFieldValue;
        this.setState(state);
    }

    async login() {

        this.setState({
            errorMsg: null,
            loadingStatus: "Authenticating"
        })

        if (!this.state.dropboxAuthCode || !this.state.encryptionPhrase) {
            this.setState({
                errorMsg: "Please enter both your dropdox auth code and encryption key",
                loadingStatus: null
            })
            return;
        }

        window.dropbox = new DropboxSDK({ accessToken: this.state.dropboxAuthCode });

        let retrievedEncryptedValidator = await (new Promise(function(resolve, reject) {

            window.dropbox
                .filesDownload({path: '/DO-NOT-DELETE-encryption-validator.txt'})
                .then(async function(data) {
                    let fr = new FileReader();
                    fr.onload = async function() {
                        resolve(this.result)
                    };
                    fr.readAsText(data.fileBlob);
                }.bind(this)).catch(function(error) {
                    if (error && (error.status === 400 || error.status === 401)) {
                        return reject("Invalid Authentication Code")
                    } else if (error && error.status === 404) {
                        return reject("No Locations Detected")
                    } else {
                        return reject("Unexpected Error");
                        console.error(error)
                    }
                }.bind(this))

        })).catch(e => {
            this.setState({
                errorMsg: e,
                loadingStatus: null
            })
        })

        if (retrievedEncryptedValidator) {

            let seed, decrypted;

            try {
                seed = await bip39.mnemonicToSeed(this.state.encryptionPhrase).then(bytes => bytes.toString('hex'));
                decrypted = AES.decrypt(retrievedEncryptedValidator, seed).toString(EncUTF8)
            } catch (e) {
                console.log(e)
                this.setState({
                    errorMsg: "Invalid Encryption Key",
                    loadingStatus: null
                })
                return;
            }

            if (decrypted === ENCRYPTION_VALIDATOR_MESSAGE) {
                encryptionKey = seed
                this.setState({
                    encryptionKey: seed,
                    loggedIn: true
                }, function() {
                    this.loadDays();
                })
            } else {
                this.setState({
                    errorMsg: "Invalid Encryption Key",
                    loadingStatus: null
                })
                return;
            }

        }

    }

    render() {

        if (!this.state.loggedIn) {
            return (
                <div className="login">
                    { (this.state.loadingStatus !== null) &&
                        <div className="full-screen-loading">
                            <div>
                                <svg className="spinner" viewBox="0 0 50 50">
                                     <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                 </svg>
                                 <h1>{this.state.loadingStatus}</h1>
                            </div>
                        </div>
                    }
                    <div className="login-container">
                        <h1>Log in</h1>
                        <p>The authentication and encryption keys are only saved to this browser tab and deleted when this tab is closed.</p>
                        <div className="form">
                            <div className="form-group">
                                <label>Dropbox Auth Code</label>
                                <input onChange={this.onInputChange} defaultValue={this.state.dropboxAuthCode} type="auth-code" name="auth-code" id="dropboxAuthCode" placeholder="Dropbox Auth Code" />
                            </div>
                            <div className="form-group">
                                <label>Encryption Key</label>
                                <input onChange={this.onInputChange} defaultValue={this.state.encryptionPhrase} type="encryption-key" name="encryption-key" id="encryptionPhrase" placeholder="Encryption Key" />
                            </div>
                            <button className="register-btn button primary" onClick={(e) => { this.login(e) }}>
                                Log in
                            </button>
                            <a href="https://itunes.apple.com/gb/app/id1512069004" target="_blank">
                                <img src={DownloadFromAppStore} />
                            </a>
                            { (this.state.errorMsg) &&
                                <div className="error-msg">{this.state.errorMsg}</div>
                            }
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="dashboard">
                { (this.state.loadingStatus !== null) &&
                    <div className="full-screen-loading">
                        <div>
                            <svg className="spinner" viewBox="0 0 50 50">
                                 <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                             </svg>
                             <h1>{this.state.loadingStatus}</h1>
                        </div>
                    </div>
                }
                <div className="days">
                    <h2>Days</h2>
                    { (this.state.days) &&
                        <div className="list">
                            { this.state.days.map(day => {
                                return (
                                    <span key={day} data-selected={(this.state.selectedDay === day)} style={{ fontWeight: 700 }} onClick={() => { this.loadDay(day) }}>{ (day.replace(".txt", "")) }</span>
                                )
                            }) }
                        </div>
                    }
                </div>
                <div className="locations">
                    <h2>Locations</h2>
                    { (this.state.day) &&
                        <div className="list">
                            { this.state.day.map(item => {
                                return (
                                    <div ref={this.selectedLocationRef} data-selected={(this.state.selectedLocation === item.id)} onClick={() => {
                                        this.setState({ selectedLocation: item.id })
                                        const map = this.mapRef.current.leafletElement;
                                        map.setView({lat: item.lat, lng: item.lng}, 21);
                                    }}>
                                        <p style={{ fontWeight: 700, marginTop: 4, marginBottom: 0 }}>{Utilities.formatDate(item.date, "HH:MM DD/MM/YYYY")}</p>
                                        { (item.house || item.street || item.city || item.country) ?
                                            <p style={{ marginBottom: 0 }}>
                                                {(item.house) && item.house + " "}
                                                {(item.street) && item.street + " "}
                                                {(item.city) && item.city + " "}
                                                {(item.country) && item.country + " "}
                                            </p>
                                            :
                                            <p style={{ marginBottom: 0 }}>{item.lat},{item.lng}</p>
                                        }
                                    </div>
                                )
                            }) }
                        </div>
                    }
                    { (!this.state.day) &&
                        <div className="list">
                            <div style={{ border: 'none' }}>
                                <p style={{ marginBotton: 0 }}>Select a day to inspect locations</p>
                            </div>
                        </div>
                    }
                </div>
                <div className="map">
                    <Map
                        locations={this.state.day ? this.state.day : []}
                        mapRef={this.mapRef}
                        groupRef={this.groupRef}
                        onMarkerClick={this.onMarkerClick}
                        mode={this.state.mode}
                        onMarkerClick={async (id) => {
                            console.log("ID: " + id);
                            this.setState({ selectedLocation: id }, function() {
                                setTimeout(function() {
                                    console.log(this.selectedLocationRef)
                                }.bind(this), 100);
                            })
                            // const map = this.mapRef.current.leafletElement;
                            // map.setView({lat: item.lat, lng: item.lng}, 21);
                        }}
                    />
                </div>
                { (this.state.day) &&
                    <div className="options">
                        { (this.state.mode === "path") ?
                            <PathIcon onClick={() => { this.setState({ mode: "point" }) }} />
                            :
                            <PointIcon onClick={() => { this.setState({ mode: "path" }) }} />
                        }
                        <DownloadIcon onClick={() => { this.downloadDay() }} />
                    </div>
                }
            </div>
        );

    }

}

export default Dashboard;
