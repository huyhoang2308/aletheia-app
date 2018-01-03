import {Component, Inject, OnInit} from '@angular/core'
import {Web3MonitorService} from '../../providers/web3/web3-monitor/web3-monitor.service'
import {Web3NetworkStatus} from '../../providers/web3/web3-monitor/web3-network-status'
import {ADDRESS} from '../../Injection-tokens'

enum StatusEnum {
  Connected,
  Error
}

@Component({
  selector: 'network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.scss']
})
export class NetworkStatusComponent {
  web3Monitor: Web3MonitorService
  address: string
  peers: number
  status: StatusEnum //todo: error handling
  balance: number

  constructor(
              web3Monitor: Web3MonitorService) {
    this.web3Monitor = web3Monitor
    web3Monitor.addListener('network-update', (err, status : Web3NetworkStatus) => {
      if(err) {
        this.peers = 0
        this.status = StatusEnum.Error
        this.address = ''
        this.balance = 0
        return
      }
      else if (status.peers === 0) {
       this.status = StatusEnum.Error
      }
      this.address = status.address
      this.status = StatusEnum.Connected
      this.peers = status.peers
      this.balance = status.balance

    })
    web3Monitor.addListener('balance-update', (err, ethBalance) => {
      if(err) {
        // todo error handling
        this.status = StatusEnum.Error
        return
      }
      this.balance = ethBalance
    })
  }
}