"use client";

// This is not exactly a provider because the convention in React is to call
// a provider a component which wraps a context provider. In Zustand, that can
// be achieved in the following way: https://docs.pmnd.rs/zustand/guides/nextjs

import { type ReactNode } from "react";
import useProtocolStore, { ProtocolData, defaultProtocolState } from "@/hooks/store";

type Props = {
    children: ReactNode;
    protocol: ProtocolData
}

export default function ProtocolStoreProvider({ children, protocol }: Props) {
    useProtocolStore.setState({ ...defaultProtocolState, ...protocol });
    return children;
}