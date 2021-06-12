import React, { useEffect, useState, useRef } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { addBid, getAskList, getBidList, setAsk, setBid, addAsk } from "./orderBookSlice";
import styles from "./OrderBook.module.css";

export function OrderBook() {
  const bidList = useAppSelector(getBidList);
  const askList = useAppSelector(getAskList);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [msg, setMsg] = useState({
    event: "subscribe",
    channel: "book",
    symbol: "tBTCUSD",
    freq: "F0",
    prec: "P0",
  });

  const w = useRef<any>();

  const populateStore = (jsonData: any[]) => {
    let bidArray: any = [];
    let askArray: any = [];
    const list = jsonData[1];
    list.forEach((element: any) => {
      const amount = element[2];
      if (amount > 0) {
        bidArray.push(element);
      } else {
        askArray.push(element);
      }
    });
    dispatch(setBid(bidArray));
    dispatch(setAsk(askArray));
    setLoading(false);
  };

  const updateStore = (jsonData: any[]) => {
    if (jsonData[1]) {
      const count = jsonData[1][1];
      const amount = jsonData[1][2];
      if (count > 0) {
        if (amount > 0) {
          dispatch(addBid(jsonData[1]));
        }
        if (amount < 0) {
          dispatch(addAsk(jsonData[1]));
        }
      }
    }
  };

  const addListener = () => {
    w.current.onmessage = function (event: any) {
      const jsonData = JSON.parse(event.data);

      // Check if initial book
      if (typeof jsonData[1] === "object" && typeof jsonData[1][0] === "object") {
        populateStore(jsonData);
      } else {
        updateStore(jsonData);
        if (loading) {
          setLoading(false);
        }
      }
    };

    w.current.onopen = function () {
      w.current.send(JSON.stringify(msg));
    };
  };

  useEffect(() => {
    if (!w.current && isConnected) {
      w.current = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
      addListener();
    }

    // Remove listener
    const socket = w.current;
    return () => {
      socket?.close();
    };
  }, [msg, isConnected]);

  const closeSocket = () => {
    w.current.close();
    w.current = null;
  };

  const handleClick = () => {
    setMsg({ ...msg, freq: msg.freq === "F0" || msg.freq === "" ? "F1" : "F0" });
    closeSocket();
    setLoading(true);
  };

  const handleInc = () => {
    const incObj: any = {
      P0: "P1",
      P1: "P2",
      P2: "P3",
      P3: "P4",
      P4: "",
    };

    if (incObj[msg.prec]) {
      setMsg({ ...msg, prec: incObj[msg.prec] });
    }

    closeSocket();
    setLoading(true);
  };

  const handleDec = () => {
    const descObj: any = {
      P0: "",
      P1: "P0",
      P2: "P1",
      P3: "P2",
      P4: "P3",
    };

    if (descObj[msg.prec]) {
      setMsg({ ...msg, prec: descObj[msg.prec] });
    }

    closeSocket();
    setLoading(true);
  };

  const handleConnect = () => {
    setIsConnected(true);
    setLoading(true);
  };

  const handleDisconnect = () => {
    closeSocket();
    setIsConnected(false);
  };

  const freqText = msg.freq === "F0" ? "REAL-TIME" : "THROTTLED 2S";

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.tableContent}>
          <thead className={styles.tableHeader}>
            <tr>
              <td>COUNT</td>
              <td className={styles.amount}>AMOUNT</td>
              <td>PRICE</td>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr className={styles.loading} />
            </tbody>
          ) : (
            <tbody>
              {bidList.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item[1]}</td>
                  <td className={styles.amount}>{item[2]}</td>
                  <td>{item[0]}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        <table className={styles.tableContent}>
          <thead className={styles.tableHeader}>
            <tr>
              <td>COUNT</td>
              <td className={styles.amount}>AMOUNT</td>
              <td>PRICE</td>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr className={styles.loading} />
            </tbody>
          ) : (
            <tbody>
              {askList.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item[1]}</td>
                  <td className={styles.amount}>{Math.abs(item[2])}</td>
                  <td>{item[0]}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <div className={styles.footer}>
        <div className={styles.leftButtons}>
          <button disabled={isConnected} onClick={handleConnect}>
            Connect Socket
          </button>
          <button disabled={!isConnected} onClick={handleDisconnect}>
            Disconnect Socket
          </button>
        </div>
        <div className={styles.rightButtons}>
          <button onClick={handleClick}>{freqText}</button>
          <button disabled={msg.prec === "P0"} onClick={handleDec}>
            - Decrease Precision
          </button>
          <button disabled={msg.prec === "P4"} onClick={handleInc}>
            + Increase Precision
          </button>
        </div>
      </div>
    </div>
  );
}
