import { useEffect, useState } from 'react'
import Cookies from 'js-cookie' 
import Web3 from 'web3';
import Web3Token from 'web3-token';
import styles from '../styles/Home.module.css'
import faunadb, { 
  Get,
  Paginate,
  Documents,
  Collection,
  Lambda,
  Map
} from 'faunadb';

export default function Home() {

  const [isLoggedin, setLoggedin] = useState(false);

  
  useEffect(() => {
    const authToken = Cookies.get('fauna-auth');
    if(authToken) {
      setLoggedin(true)
    }
  }, []);

  const login = async () => {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const address = (await web3.eth.getAccounts())[0];
    const signed_msg = await Web3Token.sign(msg => web3.eth.personal.sign(msg, address), '1h');
    const response = await fetch('api/user', {
      method: 'POST',
      body: JSON.stringify({
        signed_msg
      }),
    });
    const { token } = await response.json();
    const one_hour = new Date(new Date().getTime() +  3600 * 1000) // sign token for 1 hour
    Cookies.set('fauna-auth', token, { expires: one_hour })
    setLoggedin(true)
  }

  const logout = () => {
    Cookies.remove('fauna-auth')
    setLoggedin(false)
  }

  const queryDate = async () => {
    const authToken = Cookies.get('fauna-auth');
    const faunaClient = new faunadb.Client({ secret: authToken });
    const movies = await faunaClient.query(
      Map(
        Paginate(Documents(Collection('Movie'))),
        Lambda(x => Get(x))
      )
    )
    console.log('--->', movies);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {isLoggedin ? (
          <>
            <button onClick={queryDate}>Query Data</button>
            <button onClick={logout}>Logout</button>
          </>
        ) : 
        <button onClick={login}>Login with Metamask</button> 
        }
      </main>
    </div>
  )
}
