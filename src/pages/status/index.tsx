import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Container, CircularProgress } from '@material-ui/core';

import NodeSetupWorkflow from './NodeSetupWorkflow';
import StatusCard from './StatusCard';
import EthereumAddressCard from '../../components/EthereumAddressCard';
import { useApiHealth, useDebugApiHealth, useApiReadiness, useApiNodeAddresses, useApiChequebookAddress, useApiNodeTopology } from '../../hooks/apiHooks';

export default function Status() {
    const [beeRelease, setBeeRelease] = useState({ name: ''});
    const [isLoadingBeeRelease, setIsLoadingBeeRelease] = useState(false);

    const [apiHost, setApiHost] = useState('');
    const [debugApiHost, setDebugApiHost] = useState('');

    const { health, isLoadingHealth } = useApiHealth()
    const { nodeHealth, isLoadingNodeHealth } = useDebugApiHealth()
    const { nodeReadiness, isLoadingNodeReadiness } = useApiReadiness()
    const { nodeAddresses, isLoadingNodeAddresses } = useApiNodeAddresses()
    const { chequebookAddress, isLoadingChequebookAddress } = useApiChequebookAddress()
    const { nodeTopology, isLoadingNodeTopology } = useApiNodeTopology()


    const fetchLatestBeeRelease = async () => {
        setIsLoadingBeeRelease(true)
        axios.get(`${process.env.REACT_APP_BEE_GITHUB_REPO_URL}/releases/latest`)
        .then(res => {
            setBeeRelease(res.data)
        })
        .catch(error => {
            console.log(error)
        })
        .finally(() => {
            setIsLoadingBeeRelease(false)
        })
    }

    const fetchApiHost = () => {
        let apiHost
  
        if (sessionStorage.getItem('api_host')) {
            apiHost = String(sessionStorage.getItem('api_host') || '')
        } else {
            apiHost = String(process.env.REACT_APP_BEE_HOST)
        }
        setApiHost(apiHost)
    }

    const fetchDebugApiHost = () => {
        let debugApiHost
  
        if (sessionStorage.getItem('debug_api_host')) {
            debugApiHost = String(sessionStorage.getItem('debug_api_host') || '')
        } else {
            debugApiHost = String(process.env.REACT_APP_BEE_DEBUG_HOST)
        }
        setDebugApiHost(debugApiHost)
    }

    useEffect(() => {
        fetchApiHost()
        fetchDebugApiHost()
        fetchLatestBeeRelease()
    }, []);

    return (
        <div>
            {nodeHealth.status === 'ok' && 
            health && 
            beeRelease && 
            beeRelease.name === `v${nodeHealth.version?.split('-')[0]}` &&
            nodeAddresses.ethereum && 
            chequebookAddress.chequebookaddress && 
            nodeTopology.connected && nodeTopology.connected > 0 ? 
                <div>
                    <StatusCard 
                    nodeHealth={nodeHealth} 
                    loadingNodeHealth={isLoadingNodeHealth} 
                    nodeReadiness={nodeReadiness} 
                    loadingNodeReadiness={isLoadingNodeReadiness} 
                    beeRelease={beeRelease}
                    loadingBeeRelease={isLoadingBeeRelease}
                    nodeAddresses={nodeAddresses} 
                    loadingNodeTopology={isLoadingNodeTopology}
                    nodeTopology={nodeTopology}
                    />
                    <EthereumAddressCard 
                    nodeAddresses={nodeAddresses} 
                    isLoadingNodeAddresses={isLoadingNodeAddresses}
                    chequebookAddress={chequebookAddress}
                    isLoadingChequebookAddress={isLoadingChequebookAddress} 
                    />
                </div>
                :
                ( isLoadingNodeHealth || isLoadingHealth || isLoadingNodeReadiness || isLoadingChequebookAddress ||
                    isLoadingNodeTopology || isLoadingBeeRelease || isLoadingNodeAddresses || isLoadingBeeRelease
                ) 
                ? 
                <Container style={{textAlign:'center', padding:'50px'}}>
                    <CircularProgress />
                </Container>
                :
                <NodeSetupWorkflow
                beeRelease={beeRelease}
                isLoadingBeeRelease={isLoadingBeeRelease}

                nodeHealth={nodeHealth} 
                isLoadingNodeHealth={isLoadingNodeHealth} 

                nodeReadiness={nodeReadiness} 
                isLoadingNodeReadiness={isLoadingNodeReadiness} 

                nodeAddresses={nodeAddresses} 
                isLoadingNodeAddresses={isLoadingNodeAddresses} 

                nodeTopology={nodeTopology}
                isLoadingNodeTopology={isLoadingNodeTopology}

                nodeApiHealth={health}
                isLoadingHealth={isLoadingHealth}

                chequebookAddress={chequebookAddress}
                isLoadingChequebookAddress={isLoadingChequebookAddress}

                apiHost={apiHost}
                debugApiHost={debugApiHost}
                />
            }
        </div>
    )
}
