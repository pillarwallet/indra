import { Node } from "../../src";
import { NetworkContextForTestSuite } from "../contracts";

import { setup, SetupContext } from "./setup";
import { confirmAppInstanceInstallation, createChannel, getAppInstance, installApp } from "./utils";

const { TicTacToeApp } = global["networkContext"] as NetworkContextForTestSuite;

describe("Node method follows spec - getAppInstanceDetails", () => {
  let nodeA: Node;
  let nodeB: Node;

  beforeAll(async () => {
    const context: SetupContext = await setup(global);
    nodeA = context["A"].node;
    nodeB = context["B"].node;
  });

  it("can accept a valid call to get the desired AppInstance details", async () => {
    const multisigAddress = await createChannel(nodeA, nodeB);

    const [appInstanceId, proposedParams] = await installApp(
      nodeA,
      nodeB,
      multisigAddress,
      TicTacToeApp,
    );

    const appInstanceNodeA = await getAppInstance(nodeA, appInstanceId);
    confirmAppInstanceInstallation(proposedParams, appInstanceNodeA);

    const appInstanceNodeB = await getAppInstance(nodeB, appInstanceId);
    confirmAppInstanceInstallation(proposedParams, appInstanceNodeB);
  });
});
