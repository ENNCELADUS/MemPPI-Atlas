# TMPNet Model Pipeline

Research code that built the TMPNet network. The web app does not import it;
the app reads only the exported CSV files in `data/`.

## Layout

| Step | Script | Output |
|---|---|---|
| 1. Preprocessing (R) | `scripts/01_data_preprocessing/PPI_reference.R`, `preprocess_raw_proteomics_data.R` | Reference PPI set, proteomics matrix |
| 2. Features | `scripts/02_feature_generation/proteomics_informed_model_feature_generation.py` | Proteomics features per protein pair |
| 3a. Sequence model | `scripts/03_model_training/01_sequence_based_model/` (`DL_model_seal_link_pred.py` and modules) | `models/sequence_based_model/*.pth` |
| 3b. Proteomics model | `scripts/03_model_training/02_proteomics_informed_XGB.py` | `models/proteomic_informed_model/XGB_1v9.joblib` |
| 3c. Fusion model | `scripts/03_model_training/03_Fusion_model.py` | fusion model and `models/fusion_framework/20260610_fusion_model_scaler.joblib` |
| 4. Network construction | `scripts/04_TMPNet_construction/01_DL_model_infer.bash` → `02_ML_model_infer.py` → `03_fusion_model_infer.py` → `04_grid_search_for_degree_aware.py` | Scored pairs and the degree-aware threshold |

`01_DL_model_infer.bash` runs pretraining, fine-tuning and inference of the
sequence model in order; its header lists where each input is set.

## Model Files

| File | In Git | Where |
|---|---|---|
| `models/proteomic_informed_model/XGB_1v9.joblib` | yes | this folder |
| `models/fusion_framework/20260610_fusion_model_scaler.joblib` | yes | this folder |
| `models/sequence_based_model/DL_model_pretrain.pth` (1.53 GB) | no | not public; on request |
| `models/sequence_based_model/DL_model_finetune.pth` (763 MB) | no | not public; on request |

The sequence-model weights are too large for Git and are not published. The
Shui Group provides them on request (see the contact on the website).

The fitted fusion model `20260610_fusion_model.joblib` that
`03_fusion_model_infer.py` loads is not in the repository or a release; only
its scaler is.

## Environment

The scripts ran on the original GPU server. No lock file exists, so the
package versions below are not pinned or verified.

- Python 3 with `torch`, `torch_geometric`, `torch_sparse`, `ogb`, `esm`
  (ESM2 `esm2_t36_3B_UR50D` checkpoint), `numpy`, `pandas`, `scipy`,
  `scikit-learn`, `xgboost`, `optuna`, `networkx`, `h5py`, `joblib`,
  `matplotlib`, `tqdm`, `psutil`.
- R with `biomaRt`, `dplyr`, `readr`, `stringr`, `tidyr`.

## Paths to Change Before a Run

The scripts use absolute paths on the original server. Change these
constants to your locations:

| Script | Paths |
|---|---|
| `02_feature_generation/proteomics_informed_model_feature_generation.py` | `/home/yangly/PPI/`, `/home/luoht/ppi_label/feature_extract/{raw_ave,impseq_ave}.csv` |
| `03_model_training/01_sequence_based_model/DL_model_custom_dataset.py` | `/data02/luoht/seal_ppi/TEMP/esm_model/esm2_t36_3B_UR50D.pt` |
| `03_model_training/03_Fusion_model.py` | `/data02/luoht/logic_regression/20260610/` |
| `04_TMPNet_construction/03_fusion_model_infer.py` | `/data02/luoht/logic_regression/20260610/` (model, scaler, input and output CSVs) |
| `04_TMPNet_construction/04_grid_search_for_degree_aware.py` | `/data02/luoht/PPI_project/data/20260312_update_data/data/model_auc/20260617_test_dataset.csv` |

Input data in `model/data/` is ignored by Git.
