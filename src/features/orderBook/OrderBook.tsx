import React, { useEffect, useState, useRef } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { addBid, getAskList, getBidList, setAsk, setBid, addAsk } from "./orderBookSlice";
import styles from "./OrderBook.module.css";

let msg = {
  event: "subscribe",
  channel: "book",
  symbol: "tBTCUSD",
};

export function OrderBook() {
  const bidList = useAppSelector(getBidList);
  const askList = useAppSelector(getAskList);
  const dispatch = useAppDispatch();
  const [freq, setFreq] = useState("");

  const w = useRef<any>();

  const addListener = () => {
    w.current.onmessage = function (event: any) {
      const jsonData = JSON.parse(event.data);
      if (typeof jsonData[1] === "object" && typeof jsonData[1][0] === "object") {
        let bidArray: any = [];
        let askArray: any = [];
        const list = jsonData[1];
        list.forEach((element: any) => {
          if (element[2] > 0) {
            bidArray.push(element);
          } else {
            askArray.push(element);
          }
        });
        dispatch(setBid(bidArray));
        dispatch(setAsk(askArray));
      } else {
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
      }
    };

    w.current.onopen = function () {
      if (!freq) {
        w.current.send(JSON.stringify({ ...msg, freq: "F0" }));
      } else {
        if (freq === "F1") {
          w.current.send(JSON.stringify({ ...msg, freq: "F1" }));
        } else {
          w.current.send(JSON.stringify({ ...msg, freq: "F0" }));
        }
      }
    };
  };

  useEffect(() => {
    if (!w.current) {
      w.current = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
    }
    addListener();

    // Remove listener
    const socket = w.current;
    return () => {
      socket.close();
    };
  }, [freq]);

  const handleClick = () => {
    setFreq(freq === "F0" || freq === "" ? "F1" : "F0");
    w.current.close();
    w.current = null;
  };

  const freqText = freq === "F0" || freq === "" ? "REAL-TIME" : "THROTTLED 2S";

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <td>COUNT</td>
              <td>AMOUNT</td>
              <td>PRICE</td>
            </tr>
          </thead>
          <tbody>
            {bidList.map((item: any, index: number) => (
              <tr key={index}>
                <td>{item[1]}</td>
                <td className={styles.amount}>{item[2]}</td>
                <td>{item[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <td>COUNT</td>
              <td>AMOUNT</td>
              <td>PRICE</td>
            </tr>
          </thead>
          <tbody>
            {askList.map((item: any, index: number) => (
              <tr key={index}>
                <td>{item[1]}</td>
                <td className={styles.amount}>{Math.abs(item[2])}</td>
                <td>{item[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        <button onClick={handleClick}>{freqText}</button>
      </div>
    </div>
  );
}
