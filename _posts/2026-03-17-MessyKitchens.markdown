---
layout: post
title: "MessyKitchens: Contact-rich object-level 3D scene reconstruction"
date: 2026-03-17
categories: TUM_research
image: images/teaser_messykitchen.png
authors: "Junaid Ahmed Ansari*, <strong>Ran Ding</strong>*, Fabio Pizzati, Ivan Laptev<br><small>* Co-first authors</small>"
venue: "arXiv"
paper: "http://arxiv.org/abs/2603.16868"
page: "https://messykitchens.github.io/"
---
Monocular 3D scene reconstruction has recently seen significant progress. Powered by modern neural architectures and large-scale data, recent methods achieve high performance in depth estimation from a single image. Meanwhile, reconstructing and decomposing common scenes into individual 3D objects remains a hard challenge due to the large variety of objects, frequent occlusions, and complex object relations. Notably, beyond shape and pose estimation of individual objects, applications in robotics and animation require physically plausible scene reconstruction where objects obey physical principles of non-penetration and realistic contacts.

In this work, we advance object-level scene reconstruction along two directions. First, we introduce MessyKitchens, a new dataset with real-world scenes featuring cluttered environments and providing high-fidelity object-level ground truth in terms of 3D object shapes, poses, and accurate object contacts. Second, we build on the recent SAM 3D approach for single-object reconstruction and extend it with Multi-Object Decoder (MOD) for joint object-level scene reconstruction. We demonstrate that MessyKitchens significantly improves previous datasets in registration accuracy and inter-object penetration, and that MOD delivers consistent and significant improvements over the state of the art across three datasets.
