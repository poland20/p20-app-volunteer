import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Modal from "react-native-modal";
import * as Permissions from 'expo-permissions';

import moment from 'moment';

import axios from 'axios';

import { BarCodeScanner } from 'expo-barcode-scanner';


export class App extends React.Component {

  state = {
    showMessage: false,
    ticketId: '',
    selectedIndex: 0,
    isLoading: false,
    returnMessage: '',
    warningDate: null,
    name: null,
    type: null,
    status: 0, //1 -> error, 2 -> success, 3-> warning, 0 -> null
  }

  token = '7e9bce2e-9ba2-4d05-b299-db1cb6afd0bf';

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA);
  }

  updateIndex(selectedIndex) {
    this.setState({ selectedIndex })
  }

  getCheckInTime(date: Date) {
    return moment(date).utc().format("DD/MM/YYYY HH:mm")
  }

  sendRequest() {
    const data = {
      code: this.state.ticketId,
      ballAccess: this.state.selectedIndex == 0,
    }
    const headers = {
      'Token': this.token
    }
    this.setState({ isLoading: true, showMessage: true })
    axios.post(`https://api.poland20.com/tickets/checkIn`, data, {
      headers: headers
    })
      .then((response) => {
        const { message, status, type, checkedInDate, name } = response.data;
        this.setState({ isLoading: false, status: status == "warning" ? 3 : 2, warningDate: new Date(checkedInDate), returnMessage: message, name, type })
      })
      .catch((error) => {
        this.setState({ isLoading: false, status: 1, returnMessage: error.response.data.message, warningDate: null, returnMessage: null, name: null, type: null })

      })
  }

  render() {
    return (
      <View style={{ paddingTop: 50, paddingBottom: 20, flex: 1, backgroundColor: '#c53d57' }}>
        <ScrollView>
          <Text style={{ fontSize: 24, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', color: 'white' }}>Poland 2.0 Summit Validator</Text>
          <BarCodeScanner
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            onBarCodeScanned={(data) => { this.state.ticketId === '' ? this.setState({ ticketId: data.data }) : null }}
            style={{ height: 350 }}
          />
          <View style={{
            display: "flex",
            flexDirection: "column"
          }}>
            <View style={{ marginTop: 10, marginBottom: 10, marginLeft: '5%' }}>
              <Text style={{ fontSize: 24, color: 'white' }}>Ticket: <Text style={{ fontWeight: "bold", color: 'white' }}>{this.state.ticketId}</Text></Text>
            </View>
            <View style={{ display: "flex", flexDirection: 'row', marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => this.setState({ selectedIndex: 0 })}
                style={{
                  backgroundColor: this.state.selectedIndex == 0 ? '#66bb91' : '#c53d57',
                  borderWidth: 1,
                  borderColor: this.state.selectedIndex == 0 ? '#c53d57' : 'white',
                  flex: 1,
                  marginLeft: '5%',
                  marginRight: '5%',
                  height: 45,
                  borderRadius: 25,
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center'
                }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Ball</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({ selectedIndex: 1 })}
                style={{
                  backgroundColor: this.state.selectedIndex == 1 ? '#66bb91' : '#c53d57',
                  borderWidth: 1,
                  borderColor: this.state.selectedIndex == 1 ? '#c53d57' : 'white',
                  marginLeft: '5%',
                  marginRight: '5%',
                  flex: 1,
                  height: 45,
                  borderRadius: 25,
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center'

                }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Conference</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => { this.state.ticketId === '' ? null : this.sendRequest() }}
              style={{
                backgroundColor: this.state.ticketId !== '' ? '#66bb91' : 'rgba(102,187,145, 0.5)',
                width: '90%',
                marginLeft: '5%',
                height: 45,
                borderRadius: 25,
                display: 'flex',
                justifyContent: "center",
                alignItems: 'center',

              }}>
              <Text style={{ color: 'white', fontSize: 16 }}>{this.state.ticketId === '' ? 'Scan ticket first' : 'Verify'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ ticketId: '' })}
              style={{
                backgroundColor: 'white',
                width: '90%',
                marginLeft: '5%',
                height: 45,
                borderRadius: 25,
                display: 'flex',
                justifyContent: "center",
                alignItems: 'center',
                marginTop: 20
              }}>
              <Text style={{ color: 'black', fontSize: 16 }}>Clear</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              isVisible={this.state.showMessage}
              onRequestClose={() => {
                this.setState({ showMessage: false })
              }}
            >
              {this.state.isLoading ? <ActivityIndicator size="large" color="#ffffff" /> :
                <View style={{
                  backgroundColor: this.state.status == 1 ? '#c53d57' : (this.state.status == 2 ? '#66bb91' : '#082e9b'),
                  borderRadius: 25
                }}>
                  <Text style={{ marginTop: 10, color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 'auto', marginRight: 'auto' }}>{this.state.status == 1 ? `  ERROR!  ` : (this.state.status == 2 ? `  SUCCESS :)  ` : `  WARNING!  `)}</Text>
                  <Text style={{ color: 'white', fontSize: 24, marginLeft: 'auto', marginRight: 'auto', marginTop: 20 }}>{this.state.returnMessage}</Text>
                  {this.state.name ? [<Text key={1} style={{ color: 'white', fontSize: 24, marginLeft: 'auto', marginRight: 'auto', marginTop: 5 }}>Name: {this.state.name}</Text>] : null}
                  {this.state.warningDate ? [<Text key={2} style={{ color: 'white', fontSize: 24, marginLeft: 'auto', marginRight: 'auto', marginTop: 5 }}>Date: {this.getCheckInTime(this.state.warningDate)}</Text>] : null}
                  {this.state.type ? [<Text key={3} style={{ color: 'white', fontSize: 18, marginLeft: 'auto', marginRight: 'auto', marginTop: 5 }}>Type: {this.state.type}</Text>] : null}

                  <TouchableOpacity
                    onPress={() => this.setState({ showMessage: false, returnMessage: '', ticketId: '' })}
                    style={{
                      backgroundColor: this.state.status != 2 ? '#66bb91' : '#70d8d1',
                      width: '90%',
                      borderWidth: 1,
                      borderColor: 'white',
                      marginLeft: '5%',
                      marginBottom: 20,
                      height: 45,
                      borderRadius: 25,
                      display: 'flex',
                      justifyContent: "center",
                      alignItems: 'center',
                      marginTop: 20
                    }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Close</Text>
                  </TouchableOpacity>
                </View>}
            </Modal>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;