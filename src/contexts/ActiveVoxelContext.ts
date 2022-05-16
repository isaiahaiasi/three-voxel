import React, { createContext } from "react";

export default createContext<React.MutableRefObject<number>|null>(null);